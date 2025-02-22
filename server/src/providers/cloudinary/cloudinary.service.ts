import { Inject, Injectable } from '@nestjs/common';
import { ConfigOptions, v2 } from 'cloudinary';
import { CLOUDINARY } from './constants';

type IsUploadOkPayload = {
  public_id: string;
  version: number;
  signature: string;
};

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CLOUDINARY) private readonly cloudinaryConfig: ConfigOptions
  ) {}

  async getSignature() {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = v2.utils.api_sign_request(
      {
        timestamp
      },
      this.cloudinaryConfig.api_secret!
    );

    return {
      timestamp,
      signature
    };
  }

  isUploadOk({ public_id, version, signature }: IsUploadOkPayload): boolean {
    const expectedSignature = v2.utils.api_sign_request(
      { public_id, version },
      this.cloudinaryConfig.api_secret!
    );

    return expectedSignature === signature;
  }
}
