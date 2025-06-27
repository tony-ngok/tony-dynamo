import dynamoose from 'dynamoose'
import { TableName } from './_dynamooseConfig'

const UserSchema = new dynamoose.Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true
  },
  GSI1PK: {
    type: String,
    index: {
      name: 'nameIndex',
      type: 'global',
      rangeKey: 'GS1SK'
    }
  },
  GSI1SK: String,
  email: String,
  name: String
})

const UserModel = dynamoose.model("User", UserSchema)
const _ = new dynamoose.Table(TableName, [UserModel])
export default UserModel
