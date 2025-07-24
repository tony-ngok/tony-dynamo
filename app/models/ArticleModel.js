import dynamoose from 'dynamoose'
import { TableName } from './_dynamooseConfig'

const ArticleSchema = new dynamoose.Schema({
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
  title: String,
  content: String,
  htmlContent: String
}, {
  timestamps: {
    createdAt: { createTimestamp: Number },
    updatedAt: { updateTimestamp: Number }
  }
})

const ArticleModel = dynamoose.model("Article", ArticleSchema)
const _ = new dynamoose.Table(TableName, [ArticleModel])
export default ArticleModel
