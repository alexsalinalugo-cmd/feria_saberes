import { Injectable } from '@nestjs/common';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { PrismaService } from '../prisma.service';
import { MultipartFile } from '@fastify/multipart';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
@Injectable()
export class ProyectosService {
  constructor(private readonly prisma: PrismaService) {}
  async create(_createProyectoDto: CreateProyectoDto) {
    const proyecto = await this.prisma.proyectos.create({
      data: {
        titulo: _createProyectoDto.titulo,
        descripcion: _createProyectoDto.descripcion,
        division_id: _createProyectoDto.division_id,
      },
    });
    if (_createProyectoDto.imagenes && _createProyectoDto.imagenes.length > 0) {
      await this.prisma.imagenes_proyectos.createMany({
        data: _createProyectoDto.imagenes.map((imagen) => ({
          url_imagen: imagen.url_imagen,
          es_principal: imagen.es_principal,
          proyecto_id: proyecto.id,
        })),
      });
    }
    return proyecto;
  }

  findAll() {
    return this.prisma.proyectos.findMany({
      include: {
        division: true,
        imagenes_proyectos: true,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} proyecto`;
  }

  update(id: number, _updateProyectoDto: UpdateProyectoDto) {
    return `This action updates a #${id} proyecto`;
  }

  remove(id: number) {
    return `This action removes a #${id} proyecto`;
  }
  async uploadFile(file: MultipartFile): Promise<{ url: string }> {
    const buffer = await file.toBuffer();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'indumentaria-guada/productos',
          format: 'webp',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result)
            return reject(new Error('No se recibió respuesta de Cloudinary'));

          resolve({ url: result.secure_url });
        },
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }

  getPublicIdFromUrl(url: string): string {
    const parts = url.split('/upload/');
    if (parts.length < 2) return '';

    const pathWithoutUpload = parts[1].replace(/^v\d+\//, '');
    const lastDotIndex = pathWithoutUpload.lastIndexOf('.');
    return lastDotIndex !== -1
      ? pathWithoutUpload.substring(0, lastDotIndex)
      : pathWithoutUpload;
  }

  async deleteImageByUrl(url: string) {
    const publicId = this.getPublicIdFromUrl(url);

    if (publicId) {
      await new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
      });
    }

    return await this.prisma.imagenes_proyectos.deleteMany({
      where: { url_imagen: url },
    });
  }
}
