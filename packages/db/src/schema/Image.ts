import {
  getModelForClass,
  modelOptions,
  mongoose,
  prop,
  ReturnModelType,
} from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { collection: "images" } })
export class ImageClass {
  @prop({ required: true })
  public prompt!: string;

  @prop({ required: true })
  public imageUrl!: string;

  @prop({ default: 0 })
  public likes!: number;

  @prop({ default: Date.now })
  public createdAt!: Date;
}

export const Image =
  (mongoose.models.ImageClass as
    | ReturnModelType<typeof ImageClass>
    | undefined) ?? getModelForClass(ImageClass);
