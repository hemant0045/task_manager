pipeline {
    agent any
    
    tools {
        // Ensure this matches the Node.js tool name configured in your Jenkins: Manage Jenkins -> Tools
        nodejs 'NodeJS'
    }
    
    stages {
        stage('Checkout') {
            steps {
                // Explicitly defining the repo URL prevents empty-string errors
                git branch: 'main', url: 'https://github.com/hemant0045/task_manager.git'
            }
        }
        
        stage('Check Node.js') {
            steps {
                sh 'node -v'
                sh 'npm -v'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Build Application') {
            steps {
                // Runs build script if it exists in package.json
                sh 'npm run build --if-present'
            }
        }
        
        stage('Test Application') {
            steps {
                // Runs test script if it exists in package.json
                sh 'npm test --if-present'
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                // Uncomment this block once SonarQube server is configured in Jenkins
                /*
                withSonarQubeEnv('Your-SonarQube-Server-Name') {
                    sh 'sonar-scanner'
                }
                */
                echo 'SonarQube Analysis stage skipped (Configure withSonarQubeEnv when ready)'
            }
        }
        
        stage('Quality Gate') {
            steps {
                // Uncomment once SonarQube webhook/quality gate is set up
                /*
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
                */
                echo 'Quality Gate stage skipped'
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline execution finished.'
        }
        failure {
            echo 'FAILURE: Check Jenkins Console Output.'
        }
        success {
            echo 'SUCCESS: Pipeline executed successfully!'
        }
    }
}



