import dynamoose from 'dynamoose'
import { TableName } from './_dynamooseConfig'

const RelationSchema = new dynamoose.Schema({
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
      name: 'SortIndex',
      type: 'global',
      rangeKey: 'GSI1SK'
    }
  },
  GSI1SK: String,
  createTimestamp: Number,
  updateTimestamp: Number
},
  // {
  //   timestamps: {
  //     createdAt: { createTimestamp: Number },
  //     updatedAt: { updateTimestamp: Number }
  //   }
  // }
)

const RelationModel = dynamoose.model("Relation", RelationSchema)
const _ = new dynamoose.Table(TableName, [RelationModel])
export default RelationModel
