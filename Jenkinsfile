pipeline {
    agent none

    options {
        timestamps()
    }

    stages {
      stage('integration-tests') {
        parallel {
          stage('Ubuntu 16.04 - NodeJS 8.11') {
            agent { node { label 'ubuntu-16.04' } }
            steps {
              sh 'ZETAPUSH_DEVELOPER_LOGIN="" ZETAPUSH_DEVELOPER_PASSWORD="" npm run test:ci'
            }
          }

          stage('Win 7 Pro - NodeJS 8.11') {
            agent { node { label 'windows-7-pro' } }
            steps {
              bat 'ZETAPUSH_DEVELOPER_LOGIN="" ZETAPUSH_DEVELOPER_PASSWORD="" npm run test:ci'
            }
          }
        }
      }
    }
}