import dynamoose from 'dynamoose'
import { TableName } from './_dynamooseConfig'

const DiarySchema = new dynamoose.Schema({
  // 待完成：日记模型
})

const DiaryModel = dynamoose.model("User", DiarySchema)
const _ = new dynamoose.Table(TableName, [DiaryModel])
export default DiaryModel
