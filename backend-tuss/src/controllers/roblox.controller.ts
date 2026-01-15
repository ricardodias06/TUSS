import {inject} from '@loopback/core';
import {
  get,
  param,
  Response,
  RestBindings,
} from '@loopback/rest';
import axios from 'axios';

export class RobloxController {
  constructor(
    // Injetamos o objeto de Resposta para podermos dar ordens ao navegador
    @inject(RestBindings.Http.RESPONSE) protected res: Response,
  ) {}

  @get('/roblox/avatar/{id}')
  async getAvatar(@param.path.string('id') id: string): Promise<void> {
    // 1. URL Oficial da API do Roblox
    const apiUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${id}&size=420x420&format=Png&isCircular=false`;

    try {
      // 2. O Backend pergunta ao Roblox onde está a imagem
      const apiRes = await axios.get(apiUrl);
      
      // 3. Extraímos o link real (CDN)
      const realImageUrl = apiRes.data.data[0].imageUrl;

      if (!realImageUrl) {
        throw new Error('Imagem não encontrada');
      }

      // 4. Redirecionamento Manual (Status 302 é o padrão)
      this.res.redirect(realImageUrl);

    } catch (e: any) {
      console.error(`Erro ao buscar avatar Roblox para ${id}:`, e.message);
      
      // Se falhar, redireciona para o placeholder
      this.res.redirect('https://placehold.co/420x420/B1D566/white?text=Erro');
    }
  }
}