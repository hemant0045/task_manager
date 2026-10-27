
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Source code checked out successfully.'
            }
        }

        stage('Check Node.js') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'git --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    if (fileExists('package-lock.json')) {
                        bat 'npm ci'
                    } else {
                        bat 'npm install'
                    }
                }
            }
        }

        stage('Build Application') {
            steps {
                bat 'npm run build --if-present'
            }
        }

        stage('Test Application') {
            steps {
                script {
                    def packageJson = readJSON file: 'package.json'
                    if (packageJson.scripts?.test) {
                        bat 'npm test'
                    } else {
                        echo 'No test script configured in package.json. Skipping tests.'
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat '''
                        sonar-scanner ^
                          -Dsonar.projectKey=task_manager ^
                          -Dsonar.projectName=Task_Manager ^
                          -Dsonar.sources=. ^
                          -Dsonar.exclusions=node_modules/**,dist/**,build/**,.git/**
                    '''
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
            echo 'FAILURE: Check Jenkins Console Output.'
        }
    }
}



