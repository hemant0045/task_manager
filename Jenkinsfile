
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
                echo 'Source code checkout completed.'
            }
        }

        stage('Build and Test') {
            steps {
                sh 'mvn -B clean verify'
                echo 'Build and automated tests completed.'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube-Docker') {
                    sh '''
                      mvn -B org.sonarsource.scanner.maven:sonar-maven-plugin:5.1.0.4751:sonar \
                        -Dsonar.projectKey=devops-static-analysis
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    script {
                        def result = waitForQualityGate()
                        if (result.status != 'OK') {
                            error "Quality Gate failed: ${result.status}"
                        }
                        echo 'Quality Gate passed.'
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: CI pipeline completed.'
        }
        failure {
            echo 'FAILURE: Check the Jenkins console output.'
        }
        always {
            echo 'Pipeline execution finished.'
        }
    }
}
