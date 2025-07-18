import dynamoose from 'dynamoose'
import { TableName } from './_dynamooseConfig'

const DirSchema = new dynamoose.Schema({
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
      rangeKey: 'GSI1SK'
    }
  },
  GSI1SK: String,
  dirName: String
})

const DirModel = dynamoose.model("Dir", DirSchema)
const _ = new dynamoose.Table(TableName, [DirModel])
export default DirModel
