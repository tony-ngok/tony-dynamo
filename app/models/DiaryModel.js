import dynamoose from 'dynamoose'
import { TableName } from './_dynamooseConfig'

const DiarySchema = new dynamoose.Schema({
  pk: {
    type: String,
    hashKey: true
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
  title: String,
  content: String
})

const DiaryModel = dynamoose.model("Diary", DiarySchema)
const _ = new dynamoose.Table(TableName, [DiaryModel])
export default DiaryModel
