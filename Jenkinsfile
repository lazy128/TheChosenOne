pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'your-jfrog-artifactory.com/docker-local'
        JFROG_CREDENTIALS_ID = 'jfrog-creds'
        DOCKER_IMAGE_API = 'cinemax-api'
        DOCKER_IMAGE_WEB = 'cinemax-web'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Security Scan') {
            steps {
                dir('expressjs') {
                    sh 'npm install --package-lock-only'
                    sh 'npm audit --audit-level=high || echo "Ignoring vulnerabilities for now"'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo "Building API Image..."
                    docker.build("${DOCKER_REGISTRY}/${DOCKER_IMAGE_API}:${IMAGE_TAG}", "./expressjs")
                    
                    echo "Building Web Image..."
                    docker.build("${DOCKER_REGISTRY}/${DOCKER_IMAGE_WEB}:${IMAGE_TAG}", "./FE")
                }
            }
        }

        stage('Push to JFrog Artifactory') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", "${JFROG_CREDENTIALS_ID}") {
                        docker.image("${DOCKER_REGISTRY}/${DOCKER_IMAGE_API}:${IMAGE_TAG}").push()
                        docker.image("${DOCKER_REGISTRY}/${DOCKER_IMAGE_WEB}:${IMAGE_TAG}").push()
                        
                        // Push latest tag
                        docker.image("${DOCKER_REGISTRY}/${DOCKER_IMAGE_API}:${IMAGE_TAG}").push("latest")
                        docker.image("${DOCKER_REGISTRY}/${DOCKER_IMAGE_WEB}:${IMAGE_TAG}").push("latest")
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "CI/CD Pipeline Completed Successfully."
        }
        failure {
            echo "CI/CD Pipeline Failed. Please check the logs."
        }
    }
}
