pipeline {
  agent none

  options {
      timestamps()
      timeout(time: 120, unit: 'MINUTES')
  }

  environment {
    ZETAPUSH_DEVELOPER_ACCOUNT = credentials('jenkins-zp-account')
    ZETAPUSH_LOG_LEVEL = 'silly'
    ZETAPUSH_PLATFORM_URL = 'http://hq.zpush.io:9080/zbo/pub/business/'
    ZETAPUSH_LOCAL_DEV = 'true'
    NPM_REGISTRY = "${env.NEXUS_URL}repository/npm/"
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
        sh "npm --registry ${env.NPM_REGISTRY} ci"
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
        sh "npm --registry ${env.NPM_REGISTRY} ci"
        sh 'npm run lerna:bootstrap'
      }
    }

    stage('Publish on private registry') {
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
          sh 'npm run lerna:publish:canary -- --yes'
        }
      }
    }
    
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
        sh "npm --registry ${env.NPM_REGISTRY} ci"
        sh 'npm run lerna:clean -- --yes'
        sh "chown -R ${env.JENKINS_UID}:${env.JENKINS_GID} ."
        dir('node_modules') {
          deleteDir()
        }
      }
    }

    stage('Multi-platform') {
      parallel {
        stage('Ubuntu 16.04 - NodeJS 8.11') {
          agent { 
            node { 
              label 'ubuntu-16.04'
            }
          }
          stages {
            stage('Build') {
              steps {
                retry(3) {
                  sh "npm --registry ${env.NPM_REGISTRY} i"
                  sh 'npm run lerna:clean -- --yes'
                  sh "npm run lerna:bootstrap -- --registry ${env.NPM_REGISTRY}"
                }
              }
            }
            stage('client tests') {
              steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-zp-account', usernameVariable: 'ZETAPUSH_DEVELOPER_LOGIN', passwordVariable: 'ZETAPUSH_DEVELOPER_PASSWORD')]) {
                  ignoreFailures(failureStatus: 'UNSTABLE') {
                    dir('packages/client') {
                      sh "npm run test:ci+coverage"
                    }
                  }
                }
              }
            }
            stage('common tests') {
              steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-zp-account', usernameVariable: 'ZETAPUSH_DEVELOPER_LOGIN', passwordVariable: 'ZETAPUSH_DEVELOPER_PASSWORD')]) {
                  ignoreFailures(failureStatus: 'UNSTABLE') {
                    dir('packages/common') {
                      sh "npm run test:ci+coverage"
                    }
                  }
                }
              }
            }
            stage('user-management tests') {
              steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-zp-account', usernameVariable: 'ZETAPUSH_DEVELOPER_LOGIN', passwordVariable: 'ZETAPUSH_DEVELOPER_PASSWORD')]) {
                  ignoreFailures(failureStatus: 'UNSTABLE') {
                    dir('packages/user-management') {
                      sh "npm run test:ci+coverage"
                    }
                  }
                }
              }
            }
            stage('e2e tests') {
              steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-zp-account', usernameVariable: 'ZETAPUSH_DEVELOPER_LOGIN', passwordVariable: 'ZETAPUSH_DEVELOPER_PASSWORD')]) {
                  ignoreFailures(failureStatus: 'UNSTABLE') {
                    dir('packages/integration') {
                      sh "npm run test:ci"
                    }
                  }
                }
              }
            }
          }
          post {
            always {
              retry(3) {
                junit(allowEmptyResults: true, testResults: 'packages/*/test/reports/*/junit-*.xml,packages/*/spec/helpers/junit-*.xml')
              }
            }
            success {
              retry(3) {
                // Add projects that are uncovered with 0 coverage to have more useful results
                dir('packages/core') {
                  sh 'npm run test:ci+coverage'
                }
                dir('packages/platform-legacy') {
                  sh 'npm run test:ci+coverage'
                }
                dir('packages/troubleshooting') {
                  sh 'npm run test:ci+coverage'
                }
                dir('packages/worker') {
                  sh 'npm run test:ci+coverage'
                }
                sh "npm run coverage:merge"
                sh "npm run coverage:report"
                cobertura(coberturaReportFile: 'coverage/cobertura-coverage.xml')
                publishHTML(reportName: 'NYC Coverage', reportDir: 'coverage', reportFiles: 'index.html', reportTitles: 'Coverage', allowMissing: true, keepAll: true, alwaysLinkToLastBuild: true)
              }
            }
          }
        }

        // matrix({
        //   axes: platforms(
        //     platform(stageName: 'Win 7 Pro - NodeJS 8.11', nodeLabel: 'windows-7-pro'), 
        //     platform(stageName: 'Win 10 Pro - NodeJS 10.4', nodeLabel: 'windows-10-pro'), 
        //     platform(stageName: 'Mac High Sierra - NodeJS 8.11', nodeLabel: 'mac-high-sierra')
        //   )
        // }) {
        stage('Win 7 Pro - NodeJS 8.11') {
          when {
            anyOf {
              branch 'master'
              branch 'develop'
            }
          }
          agent { 
            node { 
              label 'windows-7-pro'
            }
          }
          stages {
            stage('Build') {
              steps {
                retry(3) {
                  bat "npm --registry ${env.NPM_REGISTRY} i"
                  bat 'npm run lerna:clean -- --yes'
                  bat "npm run lerna:bootstrap -- --registry ${env.NPM_REGISTRY}"
                }
              }
            }
            stage('client tests') {
              steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-zp-account', usernameVariable: 'ZETAPUSH_DEVELOPER_LOGIN', passwordVariable: 'ZETAPUSH_DEVELOPER_PASSWORD')]) {
                  ignoreFailures(failureStatus: 'UNSTABLE') {
                    dir('packages/client') {
                      bat "npm run test:ci"
                    }
                  }
                }
              }
            }
            stage('common tests') {
              steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-zp-account', usernameVariable: 'ZETAPUSH_DEVELOPER_LOGIN', passwordVariable: 'ZETAPUSH_DEVELOPER_PASSWORD')]) {
                  ignoreFailures(failureStatus: 'UNSTABLE') {
                    dir('packages/common') {
                      bat "npm run test:ci"
                    }
                  }
                }
              }
            }
            stage('user-management tests') {
              steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-zp-account', usernameVariable: 'ZETAPUSH_DEVELOPER_LOGIN', passwordVariable: 'ZETAPUSH_DEVELOPER_PASSWORD')]) {
                  ignoreFailures(failureStatus: 'UNSTABLE') {
                    dir('packages/user-management') {
                      bat "npm run test:ci"
                    }
                  }
                }
              }
            }
            stage('e2e tests') {
              steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-zp-account', usernameVariable: 'ZETAPUSH_DEVELOPER_LOGIN', passwordVariable: 'ZETAPUSH_DEVELOPER_PASSWORD')]) {
                  ignoreFailures(failureStatus: 'UNSTABLE') {
                    dir('packages/integration') {
                      bat "npm run test:ci"
                    }
                  }
                }
              }
            }
          }
          post {
            always {
              retry(3) {
                junit(allowEmptyResults: true, testResults: 'packages/*/test/reports/*/junit-*.xml,packages/*/spec/helpers/junit-*.xml')
              }
            }
          }
        }

        stage('Win 10 Pro - NodeJS 10.4') {
          when {
            anyOf {
              branch 'master'
              branch 'develop'
            }
          }
          agent { 
            node { 
              label 'windows-10-pro'
            }
          }
          stages {
            stage('Build') {
              steps {
                retry(3) {
                  bat "npm --registry ${env.NPM_REGISTRY} ci"
                  bat 'npm run lerna:clean -- --yes'
                  bat "npm run lerna:bootstrap -- --registry ${env.NPM_REGISTRY}"
                }
              }
            }
            stage('client tests') {
              steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-zp-account', usernameVariable: 'ZETAPUSH_DEVELOPER_LOGIN', passwordVariable: 'ZETAPUSH_DEVELOPER_PASSWORD')]) {
                  ignoreFailures(failureStatus: 'UNSTABLE') {
                    dir('packages/client') {
                      bat "npm run test:ci"
                    }
                  }
                }
              }
            }
            stage('common tests') {
              steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-zp-account', usernameVariable: 'ZETAPUSH_DEVELOPER_LOGIN', passwordVariable: 'ZETAPUSH_DEVELOPER_PASSWORD')]) {
                  ignoreFailures(failureStatus: 'UNSTABLE') {
                    dir('packages/common') {
                      bat "npm run test:ci"
                    }
                  }
                }
              }
            }
            stage('user-management tests') {
              steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-zp-account', usernameVariable: 'ZETAPUSH_DEVELOPER_LOGIN', passwordVariable: 'ZETAPUSH_DEVELOPER_PASSWORD')]) {
                  ignoreFailures(failureStatus: 'UNSTABLE') {
                    dir('packages/user-management') {
                      bat "npm run test:ci"
                    }
                  }
                }
              }
            }
            stage('e2e tests') {
              steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-zp-account', usernameVariable: 'ZETAPUSH_DEVELOPER_LOGIN', passwordVariable: 'ZETAPUSH_DEVELOPER_PASSWORD')]) {
                  ignoreFailures(failureStatus: 'UNSTABLE') {
                    dir('packages/integration') {
                      bat "npm run test:ci"
                    }
                  }
                }
              }
            }
          }
          post {
            always {
              retry(3) {
                junit(allowEmptyResults: true, testResults: 'packages/*/test/reports/*/junit-*.xml,packages/*/spec/helpers/junit-*.xml')
              }
            }
          }
        }


        stage('Mac High Sierra - NodeJS 8.11') {
          when {
            anyOf {
              branch 'master'
              branch 'develop'
            }
          }
          agent { 
            node { 
              label 'mac-high-sierra'
            }
          }
          stages {
            stage('Build') {
              steps {
                retry(3) {
                  bat "npm --registry ${env.NPM_REGISTRY} i"
                  bat 'npm run lerna:clean -- --yes'
                  bat "npm run lerna:bootstrap -- --registry ${env.NPM_REGISTRY}"
                }
              }
            }
            stage('client tests') {
              steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-zp-account', usernameVariable: 'ZETAPUSH_DEVELOPER_LOGIN', passwordVariable: 'ZETAPUSH_DEVELOPER_PASSWORD')]) {
                  ignoreFailures(failureStatus: 'UNSTABLE') {
                    dir('packages/client') {
                      bat "npm run test:ci"
                    }
                  }
                }
              }
            }
            stage('common tests') {
              steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-zp-account', usernameVariable: 'ZETAPUSH_DEVELOPER_LOGIN', passwordVariable: 'ZETAPUSH_DEVELOPER_PASSWORD')]) {
                  ignoreFailures(failureStatus: 'UNSTABLE') {
                    dir('packages/common') {
                      bat "npm run test:ci"
                    }
                  }
                }
              }
            }
            stage('user-management tests') {
              steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-zp-account', usernameVariable: 'ZETAPUSH_DEVELOPER_LOGIN', passwordVariable: 'ZETAPUSH_DEVELOPER_PASSWORD')]) {
                  ignoreFailures(failureStatus: 'UNSTABLE') {
                    dir('packages/user-management') {
                      bat "npm run test:ci"
                    }
                  }
                }
              }
            }
            stage('e2e tests') {
              steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-zp-account', usernameVariable: 'ZETAPUSH_DEVELOPER_LOGIN', passwordVariable: 'ZETAPUSH_DEVELOPER_PASSWORD')]) {
                  ignoreFailures(failureStatus: 'UNSTABLE') {
                    dir('packages/integration') {
                      bat "npm run test:ci"
                    }
                  }
                }
              }
            }
          }
          post {
            always {
              retry(3) {
                junit(allowEmptyResults: true, testResults: 'packages/*/test/reports/*/junit-*.xml,packages/*/spec/helpers/junit-*.xml')
              }
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