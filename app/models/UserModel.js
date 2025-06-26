import dynamoose from 'dynamoose'
import { TableName } from './_dynamooseConfig'

const UserSchema = new dynamoose.Schema({
  pk: {
    type: String,
    hashKey: true
  },
  email: String,
  name: String,
  isAdmin: Boolean
})

const UserModel = dynamoose.model("User", UserSchema)
const _ = new dynamoose.Table(TableName, [UserModel])
export default UserModel
