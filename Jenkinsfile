pipeline {
  agent none

  options {
      timestamps()
      timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    ZETAPUSH_DEVELOPER_ACCOUNT = credentials('jenkins-zetapush-celtia-account')
  }

  stages {
    stage('Integration Tests') {
      parallel {
        stage('Ubuntu 16.04 - NodeJS 8.11') {
          agent { 
            node { 
              label 'ubuntu-16.04'
            }
          }
          steps {
            dir('packages/integration') {
              sh 'npm i'
              sh "ZETAPUSH_DEVELOPER_LOGIN='${env.ZETAPUSH_DEVELOPER_ACCOUNT_USR}' ZETAPUSH_DEVELOPER_PASSWORD='${env.ZETAPUSH_DEVELOPER_ACCOUNT_PSW}' npm run test:npm5"
            }
          }
          post {
            always {
              deleteDir()
            }
          }
        }

        stage('Win 7 Pro - NodeJS 8.11') {
          agent { 
            node { 
              label 'windows-7-pro'
            }
          }
          steps {
            dir('packages/integration') {
              bat 'npm i'
              bat "set ZETAPUSH_DEVELOPER_LOGIN='${env.ZETAPUSH_DEVELOPER_ACCOUNT_USR}'"
              bat "set ZETAPUSH_DEVELOPER_PASSWORD='${env.ZETAPUSH_DEVELOPER_ACCOUNT_PSW}'"
              bat 'npm run test:npm5'
            }
          }
          post {
            always {
              deleteDir()
            }
          }
        }

        stage('Win 10 Pro - NodeJS 10.4') {
          agent { 
            node { 
              label 'windows-10-pro'
            }
          }
          steps {
            dir('packages/integration') {
              bat 'npm i'
              bat "set ZETAPUSH_DEVELOPER_LOGIN='${env.ZETAPUSH_DEVELOPER_ACCOUNT_USR}'"
              bat "set ZETAPUSH_DEVELOPER_PASSWORD='${env.ZETAPUSH_DEVELOPER_ACCOUNT_PSW}'"
              bat 'npm run test:npm6'
            }
          }
          post {
            always {
              deleteDir()
            }
          }
        }

        stage('Mac High Sierra - NodeJS 8.11') {
          agent { 
            node { 
              label 'mac-high-sierra'
            }
          }
          steps {
            dir('packages/integration') {
              sh 'npm i'
              sh "ZETAPUSH_DEVELOPER_LOGIN='${env.ZETAPUSH_DEVELOPER_ACCOUNT_USR}' ZETAPUSH_DEVELOPER_PASSWORD='${env.ZETAPUSH_DEVELOPER_ACCOUNT_PSW}' npm run test:npm5"
            }
          }
          post {
            always {
              deleteDir()
            }
          }
        }
      }
    }
  }

  post {
    failure {
      slackSend(
          message: """ZetaPush celtia client : ${env.BRANCH_NAME} failed to build
                      - <${env.BUILD_URL}/consoleFull|View logs>""",
          color: '#ff0000'
      )
      emailext(
          subject: '${DEFAULT_SUBJECT}',
          body: '${DEFAULT_CONTENT}', 
          attachLog: true, 
          recipientProviders: [[$class: 'CulpritsRecipientProvider']]
      )
    }      
    success {
      slackSend(
          message: """ZetaPush celtia client : ${env.BRANCH_NAME} success
                      - <${env.BUILD_URL}/consoleFull|View logs>""",
          color: '#00ff00'
      )
    }
  }
}