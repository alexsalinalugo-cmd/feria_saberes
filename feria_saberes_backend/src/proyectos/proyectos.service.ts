import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { UpdateProyectoPropietarioDto } from './dto/update-proyecto-propietario.dto';
import { PrismaService } from '../prisma.service';
import { MultipartFile } from '@fastify/multipart';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
@Injectable()
export class ProyectosService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createProyectoDto: CreateProyectoDto, usuarioId: number) {
    return this.prisma.proyectos.create({
      data: {
        titulo: createProyectoDto.titulo.trim(),
        descripcion: createProyectoDto.descripcion?.trim() || null,
        division: { connect: { id: createProyectoDto.division_id } },
        usuario: { connect: { id: usuarioId } },
        imagenes_proyectos: {
          create: (createProyectoDto.imagenes || []).map((image) => ({
            url_imagen: image.url_imagen,
            es_principal: image.es_principal,
          })),
        },
        expositores: {
          create: (createProyectoDto.expositores || [])
            .map((nombre) => nombre.trim())
            .filter(Boolean)
            .map((nombre_completo) => ({ nombre_completo })),
        },
      },
      include: {
        division: true,
        imagenes_proyectos: true,
        expositores: true,
      },
    });
  }

  findMine(usuarioId: number) {
    return this.prisma.proyectos.findMany({
      where: { usuario_id: usuarioId },
      include: {
        division: true,
        imagenes_proyectos: true,
        expositores: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async updateMine(
    proyectoId: number,
    usuarioId: number,
    updateProyectoDto: UpdateProyectoPropietarioDto,
  ) {
    const proyecto = await this.prisma.proyectos.findFirst({
      where: { id: proyectoId, usuario_id: usuarioId },
      include: { imagenes_proyectos: true },
    });
    if (!proyecto) {
      throw new NotFoundException(
        'No se encontró el proyecto o no tenés permiso para editarlo.',
      );
    }

    const currentImagesById = new Map(
      proyecto.imagenes_proyectos.map((image) => [image.id, image]),
    );
    const retainedImages = updateProyectoDto.imagenes.filter(
      (image) => image.id !== undefined,
    );
    if (
      retainedImages.some(
        (image) => image.id === undefined || !currentImagesById.has(image.id),
      ) ||
      new Set(retainedImages.map((image) => image.id)).size !==
        retainedImages.length
    ) {
      throw new NotFoundException(
        'Una o más imágenes no pertenecen a este proyecto.',
      );
    }

    const images = updateProyectoDto.imagenes.map((image, index) => {
      const currentImage =
        image.id === undefined ? undefined : currentImagesById.get(image.id);
      if (image.id !== undefined && !currentImage) {
        throw new NotFoundException(
          'Una o más imágenes no pertenecen a este proyecto.',
        );
      }
      return {
        url_imagen: currentImage?.url_imagen || image.url_imagen,
        es_principal: index === 0,
      };
    });

    await this.prisma.$transaction(async (transaction) => {
      const updatedProject = await transaction.proyectos.updateMany({
        where: { id: proyectoId, usuario_id: usuarioId },
        data: {
          titulo: updateProyectoDto.titulo.trim(),
          descripcion: updateProyectoDto.descripcion?.trim() || null,
          division_id: updateProyectoDto.division_id,
        },
      });
      if (updatedProject.count !== 1) {
        throw new NotFoundException(
          'No se encontró el proyecto o no tenés permiso para editarlo.',
        );
      }
      await transaction.imagenes_proyectos.deleteMany({
        where: { proyecto_id: proyectoId },
      });
      if (images.length > 0) {
        await transaction.imagenes_proyectos.createMany({
          data: images.map((image) => ({
            ...image,
            proyecto_id: proyectoId,
          })),
        });
      }
      await transaction.expositores.deleteMany({
        where: { proyecto_id: proyectoId },
      });
      const exhibitors = updateProyectoDto.expositores
        .map((name) => name.trim())
        .filter(Boolean);
      if (exhibitors.length > 0) {
        await transaction.expositores.createMany({
          data: exhibitors.map((nombre_completo) => ({
            nombre_completo,
            proyecto_id: proyectoId,
          })),
        });
      }
    });

    return this.prisma.proyectos.findUniqueOrThrow({
      where: { id: proyectoId },
      include: {
        division: true,
        imagenes_proyectos: true,
        expositores: true,
      },
    });
  }

  findAll() {
    return this.prisma.proyectos.findMany({
      include: {
        division: true,
        imagenes_proyectos: true,
      },
    });
  }

  async findOne(id: number) {
    const proyecto = await this.prisma.proyectos.findUnique({
      where: { id },
      include: {
        division: true,
        imagenes_proyectos: true,
        expositores: true,
      },
    });

    if (!proyecto) {
      throw new NotFoundException(`No se encontró el proyecto ${id}.`);
    }

    return proyecto;
  }

  async update(_updateProyectoDto: UpdateProyectoDto) {
    const proyecto = await this.prisma.proyectos.findFirst({
      where: { id: _updateProyectoDto.proyectoId },
    });

    if (!proyecto) {
      throw new Error(
        `Proyecto with ID ${_updateProyectoDto.proyectoId} not found`,
      );
    }

    // Convertimos el Decimal a number antes de sumar
    const valorActual = proyecto.valoracion ? Number(proyecto.valoracion) : 0;
    const updatedPuntuacion = valorActual + _updateProyectoDto.puntuacion;

    return this.prisma.proyectos.update({
      where: { id: _updateProyectoDto.proyectoId },
      data: { valoracion: updatedPuntuacion },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} proyecto`;
  }
  async uploadFile(file: MultipartFile): Promise<{ url: string }> {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
      process.env;
    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_API_KEY ||
      !CLOUDINARY_API_SECRET
    ) {
      throw new ServiceUnavailableException(
        'La subida de imágenes no está configurada en el servidor.',
      );
    }
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });

    const buffer = await file.toBuffer();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'feria_saberes',
          format: 'webp',
        },
        (error, result) => {
          if (error) {
            reject(new Error(error.message));
            return;
          }
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
      await cloudinary.uploader.destroy(publicId);
    }

    return this.prisma.imagenes_proyectos.deleteMany({
      where: { url_imagen: url },
    });
  }
  async createResena(resenaDto: any) {
    return await this.prisma.resenas_proyectos.create({
      data: {
        proyecto_id: resenaDto.proyectoId,
        nombre: resenaDto.nombre,
        comentario: resenaDto.comentario,
      },
    });
  }
  async findAllResenas(proyectoId: number) {
    return await this.prisma.resenas_proyectos.findMany({
      where: { proyecto_id: proyectoId },
      orderBy: { created_at: 'desc' },
    });
  }
}
