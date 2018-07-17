pipeline {
  agent none

  options {
      timestamps()
      timeout(time: 60, unit: 'MINUTES')
  }

  environment {
    ZETAPUSH_DEVELOPER_ACCOUNT = credentials('jenkins-zp-account')
    ZETAPUSH_LOG_LEVEL = 'silly'
    ZETAPUSH_PLATFORM_URL = 'http://hq.zpush.io:9080/zbo/pub/business/'
    ZETAPUSH_LOCAL_DEV = 'true'
  }

  stages {
    stage('Clean') {
      agent { 
        docker {
          image 'node:10.4.1'
          label 'docker'
          args '-u 0:0'
        }
      }
      steps {
        sh 'npm cache clear --force'
        sh 'npm i'
        sh 'npm run lerna:clean -- --yes'
      }
    }

    stage('Build') {
      agent { 
        docker {
          image 'node:10.4.1'
          label 'docker'
          args '-u 0:0'
        }
      }
      steps {
        sh 'npm i'
        sh 'npm run lerna:bootstrap'
      }
    }

    // stage('Publish on private registry') {
    //   agent { 
    //     docker {
    //       image 'node:10.4.1'
    //       label 'docker'
    //       args '-u 0:0'
    //     }
    //   }
    //   steps {
    //     withCredentials([usernamePassword(credentialsId: 'npm-publish-on-public-registry', usernameVariable: 'NPM_USER', passwordVariable: 'NPM_PASS')]) {
    //       script {
    //         def response = httpRequest(
    //           url: "https://registry.npmjs.org/-/user/org.couchdb.user:${env.NPM_USER}",
    //           contentType: 'APPLICATION_JSON',
    //           acceptType: 'APPLICATION_JSON',
    //           httpMode: 'PUT',
    //           requestBody: "{\"name\":\"${env.NPM_USER}\", \"password\": \"${env.NPM_PASS}\"}"
    //         )
    //         def json = readJSON(text: response.content)
    //         sh "npm set //registry.npmjs.org/:_authToken ${json.token}"
    //       }
    //       sh 'npm run lerna:publish:canary -- --yes'
    //     }
    //   }
    // }*
    
    /**
     * This stage is needed for Ubuntu slave because
     * Original build is node in Docker and may be executed on same Unbuntu slave
     * as Ubuntu slave (without Docker this time).
     */
    stage('Clear again and fix permissions') {
      agent { 
        docker {
          image 'node:10.4.1'
          label 'docker'
          args '-u 0:0'
        }
      }
      steps {
        sh 'npm cache clear --force'
        sh 'npm i'
        sh 'npm run lerna:clean -- --yes'
        sh "chown -R ${env.JENKINS_UID}:${env.JENKINS_GID} ."
      }
    }

    stage('Integration Tests') {
      parallel {
        stage('Ubuntu 16.04 - NodeJS 8.11') {
          agent { 
            node { 
              label 'ubuntu-16.04'
            }
          }
          steps {
            // sh 'npm cache clear --force'
            sh 'npm i'
            sh 'npm run lerna:clean -- --yes'
            sh 'npm run lerna:bootstrap'
            dir('packages/integration') {
              // sh 'npm cache clear --force'
              // sh 'npm i'
              sh "ZETAPUSH_DEVELOPER_LOGIN='${env.ZETAPUSH_DEVELOPER_ACCOUNT_USR}' ZETAPUSH_DEVELOPER_PASSWORD='${env.ZETAPUSH_DEVELOPER_ACCOUNT_PSW}' node node_modules/jasmine/bin/jasmine.js"
            }
          }
          post {
            always {
              junit(allowEmptyResults: true, testResults: '**/junit-*.xml')
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
            // bat 'npm cache clear --force'
            bat 'npm i'
            bat 'npm run lerna:clean -- --yes'
            bat 'npm run lerna:bootstrap'
            dir('packages/integration') {
              // bat 'npm cache clear --force'
              // bat 'npm i'
              bat "set ZETAPUSH_DEVELOPER_LOGIN=${env.ZETAPUSH_DEVELOPER_ACCOUNT_USR}&& set ZETAPUSH_DEVELOPER_PASSWORD=${env.ZETAPUSH_DEVELOPER_ACCOUNT_PSW}&& node node_modules\\jasmine\\bin\\jasmine.js"
            }
          }
          post {
            always {
              junit(allowEmptyResults: true, testResults: '**/junit-*.xml')
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
            // bat 'npm cache clear --force'
            bat 'npm i'
            bat 'npm run lerna:clean -- --yes'
            bat 'npm run lerna:bootstrap'
            dir('packages/integration') {
              // bat 'npm cache clear --force'
              // bat 'npm i'
              bat "set ZETAPUSH_DEVELOPER_LOGIN=${env.ZETAPUSH_DEVELOPER_ACCOUNT_USR}&& set ZETAPUSH_DEVELOPER_PASSWORD=${env.ZETAPUSH_DEVELOPER_ACCOUNT_PSW}&& node node_modules\\jasmine\\bin\\jasmine.js"
            }
          }
          post {
            always {
              junit(allowEmptyResults: true, testResults: '**/junit-*.xml')
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
            // sh 'npm cache clear --force'
            sh 'npm i'
            sh 'npm run lerna:clean -- --yes'
            sh 'npm run lerna:bootstrap'
            dir('packages/integration') {
              // sh 'npm cache clear --force'
              // sh 'npm i'
              sh "ZETAPUSH_DEVELOPER_LOGIN='${env.ZETAPUSH_DEVELOPER_ACCOUNT_USR}' ZETAPUSH_DEVELOPER_PASSWORD='${env.ZETAPUSH_DEVELOPER_ACCOUNT_PSW}' node node_modules/jasmine/bin/jasmine.js"
            }
          }
          post {
            always {
              junit(allowEmptyResults: true, testResults: '**/junit-*.xml')
              deleteDir()
            }
          }
        }
      }
    }

    stage('Publish on npm registry') {
      when {
        branch 'master'
      }
      agent { 
        docker {
          image 'node:10.4.1'
          label 'docker'
          args '-u 0:0'
        }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'npm-publish-on-public-registry', usernameVariable: 'NPM_USER', passwordVariable: 'NPM_PASS')]) {
          script {
            def response = httpRequest(
              url: "https://registry.npmjs.org/-/user/org.couchdb.user:${env.NPM_USER}",
              contentType: 'APPLICATION_JSON',
              acceptType: 'APPLICATION_JSON',
              httpMode: 'PUT',
              requestBody: "{\"name\":\"${env.NPM_USER}\", \"password\": \"${env.NPM_PASS}\"}"
            )
            def json = readJSON(text: response.content)
            sh "npm set //registry.npmjs.org/:_authToken ${json.token}"
          }
          sh 'npm run lerna:publish -- --cd-version patch --yes'
        }
      }
    }

    stage('Generate API documentation') {
      when {
        branch 'docs/api'
      }

      agent { 
        docker {
          image 'node:10.4.1'
          label 'docker'
          args '-u 0:0'
        }
      }

      steps {
        // checkout gh-pages
        dir('target/documentation') {
          git(url: 'git@github.com:zetapush/zetapush.git', branch: 'gh-pages')
        }

        sh 'cd packages/platform && npm i'
        sh 'cd packages/platform && npm run build:api-doc'


        // copy new documentation to gh-pages local repo
        sh 'cp -rf packages/platform/docs/* target/documentation'

        // commit
        sh 'cd target/documentation && git add .'
        sh 'cd target/documentation && git commit -m "Update generated documentation"'
        // push on gh-pages
        sshagent(['github-ssh']) {
          sh 'mkdir ~/.ssh'
          sh 'ssh-keyscan github.com >> ~/.ssh/known_hosts'
          sh 'cd target/documentation && git push origin gh-pages'
        }
      }
    }
  }
    

  post {
    failure {
      slackSend(
          message: """ZetaPush celtia client: ${env.BRANCH_NAME} failed to build
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
          message: """ZetaPush celtia client: ${env.BRANCH_NAME} success
                      - <${env.BUILD_URL}/consoleFull|View logs>""",
          color: '#00ff00'
      )
    }
  }
}