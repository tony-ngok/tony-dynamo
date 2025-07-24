import dynamoose from 'dynamoose'
import { TableName } from './_dynamooseConfig'

const CommentSchema = new dynamoose.Schema({
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
    timestamps: {
      createdAt: { createTimestamp: Number },
      updatedAt: { updateTimestamp: Number }
    }
  }
})

const CommentModel = dynamoose.model("Comment", CommentSchema)
const _ = new dynamoose.Table(TableName, [CommentModel])
export default CommentModel
