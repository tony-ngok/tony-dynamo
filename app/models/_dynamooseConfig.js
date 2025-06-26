import dynamoose from 'dynamoose'

const ddb = new dynamoose.aws.ddb.DynamoDB({
  credentials: {
    accessKeyId: process.env.PRIVATE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.PRIVATE_AWS_SECRET_ACCESS_KEY
  },
  region: process.env.PRIVATE_AWS_REGION
})

dynamoose.aws.ddb.set(ddb)
dynamoose.Table.defaults.set({
  create: false,
  waitForActive: { enabled: false }
})

export const TableName = 'TonyTable'
