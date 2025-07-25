import dynamoose from 'dynamoose'
import { TableName } from './_dynamooseConfig'

const DirSchema = new dynamoose.Schema({
  pk: {
    type: String,
    hashKey: true
  },
  sk: {
    type: String,
    rangeKey: true,
    index: {
      name: 'SearchIndex',
      type: 'global'
    }
  },
  GSI1PK: {
    type: String,
    index: {
      name: 'SortIndex',
      type: 'global',
      rangeKey: 'GSI1SK'
    }
  },
  GSI1SK: Number,
  dirName: String
}, {
  timestamps: {
    createdAt: { createTimestamp: Number },
    updatedAt: { updateTimestamp: Number }
  }
})

const DirModel = dynamoose.model("Dir", DirSchema)
const _ = new dynamoose.Table(TableName, [DirModel])
export default DirModel
