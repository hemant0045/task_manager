
pipeline {
    agent any

    stages {
        stage('Check Node.js') {
            steps {
                bat 'node --version'
                bat 'npm --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build and Test') {
            steps {
                bat 'npm test'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat 'sonar-scanner'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        def result = waitForQualityGate()

                        if (result.status != 'OK') {
                            error "Quality Gate failed: ${result.status}"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution finished.'
        }

        success {
            echo 'SUCCESS: Pipeline completed.'
        }

        failure {
            echo 'FAILURE: Check Jenkins console output.'
        }
    }
}


