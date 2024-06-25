import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  // create folder name
  createFolder(folderName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Kiểm tra xem thư mục đã tồn tại hay chưa
      v2.api.sub_folders('AloHoaFlower', (error: any, result: any) => {
        if (error) {
          reject(
            new Error('Có lỗi xảy ra khi truy vấn thư mục trên Cloudinary'),
          );
        } else {
          // Kiểm tra xem folderName đã tồn tại trong danh sách các thư mục không
          const existingFolder = result.folders.find(
            (folder: any) => folder.name === folderName,
          );
          if (existingFolder) {
            // Thư mục đã tồn tại, trả về kết quả mà không tạo lại
            resolve(existingFolder);
          } else {
            // Thư mục chưa tồn tại, tạo mới
            v2.api.create_folder(
              `AloHoaFlower/${folderName}`,
              (createError: any, createResult: any) => {
                if (createError) {
                  reject(
                    new Error('Có lỗi xảy ra khi tạo thư mục trên Cloudinary'),
                  );
                } else {
                  resolve(createResult);
                }
              },
            );
          }
        }
      });
    });
  }

  // handle upload file
  uploadFile(
    folderName: string,
    file: Express.Multer.File,
  ): Promise<UploadApiErrorResponse | UploadApiResponse> {
    return new Promise<UploadApiErrorResponse | UploadApiResponse>(
      (resolve, reject) => {
        // Đường dẫn đầy đủ tới thư mục cần upload
        const uploadPath = `AloHoaFlower/${folderName}`;

        const upload = v2.uploader.upload_stream(
          { resource_type: 'auto', folder: uploadPath },
          (error, result) => {
            if (error) reject(error);
            resolve(result);
          },
        );
        streamifier.createReadStream(file.buffer).pipe(upload);
      },
    );
  }

  // delete file
  async deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      v2.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(new Error('Xoá hình ảnh trên cloudinary thất bại'));
        } else {
          resolve(result);
        }
      });
    });
  }
}
