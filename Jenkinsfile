pipeline {
    agent any

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'prod'],
            description: 'Environment to deploy to'
        )
        string(
            name: 'BRANCH',
            defaultValue: 'main',
            description: 'Branch to deploy from'
        )
    }

    environment {
        DEV_S3_BUCKET   = 'railtick-admin-dev'
        PROD_S3_BUCKET  = 'railtick-admin-prod'
        DEV_CF_DIST_ID  = 'E1ADDMUBLC27CM'
        PROD_CF_DIST_ID = 'E1JF7MWGDCVTFW'
        AWS_REGION      = 'ap-south-1'
    }

    stages {

        stage('Checkout') {
            steps {
                git credentialsId: 'github-credentials',
                    url: 'https://github.com/mehulbansal2003/railway-admin-web',
                    branch: "${params.BRANCH}"
            }
        }

        stage('Inject Env File') {
            steps {
                script {
                    def secretsPath = '/home/ubuntu/railtick-frontend-secrets/admin-web'
                    if (params.ENVIRONMENT == 'prod') {
                        sh "mkdir -p environment && cp ${secretsPath}/.env.production environment/.env.production"
                    } else {
                        sh "mkdir -p environment && cp ${secretsPath}/.env.development environment/.env.development"
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                script {
                    if (params.ENVIRONMENT == 'prod') {
                        sh 'npm run build:prod'
                    } else {
                        sh 'npm run build:dev'
                    }
                }
            }
        }

        stage('Deploy to S3') {
            steps {
                script {
                    def bucket = params.ENVIRONMENT == 'prod'
                        ? env.PROD_S3_BUCKET
                        : env.DEV_S3_BUCKET

                    sh """
                        aws s3 sync dist/ s3://${bucket}/ \
                            --region ${AWS_REGION} \
                            --delete \
                            --cache-control "public, max-age=31536000" \
                            --exclude "index.html" \
                            --exclude "*.json"

                        aws s3 cp dist/index.html s3://${bucket}/index.html \
                            --region ${AWS_REGION} \
                            --cache-control "no-cache, no-store, must-revalidate"
                    """
                }
            }
        }

        stage('Invalidate CloudFront') {
            steps {
                script {
                    def distId = params.ENVIRONMENT == 'prod'
                        ? env.PROD_CF_DIST_ID
                        : env.DEV_CF_DIST_ID

                    sh """
                        aws cloudfront create-invalidation \
                            --distribution-id ${distId} \
                            --paths "/*"
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ ${params.ENVIRONMENT} frontend deployed successfully"
        }
        failure {
            echo "❌ Frontend deployment failed"
        }
    }
}
