pipeline {
    agent none

    options {
        timestamps()
    }

    stages {
      stage('Integration Tests') {
        parallel {
          stage('Ubuntu 16.04 - NodeJS 8.11') {
            agent { node { label 'ubuntu-16.04' } }
            steps {
              dir('packages/integration') {
                sh 'npm i'
                sh 'ZETAPUSH_DEVELOPER_LOGIN="" ZETAPUSH_DEVELOPER_PASSWORD="" npm run test:ci'
              }
            }
          }

          stage('Win 7 Pro - NodeJS 8.11') {
            agent { node { label 'windows-7-pro' } }
            steps {
              dir('packages/integration') {
                bat 'npm i'
                bat 'set ZETAPUSH_DEVELOPER_LOGIN=""'
                bat 'set ZETAPUSH_DEVELOPER_PASSWORD=""'
                bat 'npm run test:ci'
              }
            }
          }
        }
      }
    }
}