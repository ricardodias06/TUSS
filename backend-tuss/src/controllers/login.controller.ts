import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  post,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {TokenService} from '@loopback/authentication';
import {UserProfile, securityId} from '@loopback/security';
import {UserRepository} from '../repositories';
import {compare} from 'bcryptjs';

export class LoginController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @post('/login')
  @response(200, {
    description: 'Token de acesso',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {type: 'string'},
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
              username: {type: 'string'},
              password: {type: 'string'},
            },
          },
        },
      },
    })
    credentials: {username: string; password: string},
  ): Promise<{token: string; user: any}> {
    
    // 1. Procurar utilizador e incluir o Rank
    const user = await this.userRepository.findOne({
      where: {robloxUsername: credentials.username},
      include: [{relation: 'rank'}] 
    });

    if (!user) {
      throw new HttpErrors.Unauthorized('Utilizador não encontrado.');
    }

    // 2. Verificar password
    const passwordMatched = await compare(credentials.password, user.password);
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Password incorreta.');
    }

    // 3. Gerar Token
    const userProfile: UserProfile = {
      [securityId]: user.id?.toString() || '',
      name: user.displayName,
      id: user.id?.toString(),
      email: user.robloxUsername
    };
    
    const token = await this.jwtService.generateToken(userProfile);

    // 4. Retornar TUDO (Correção Aqui)
    // Agora enviamos o staffId e o robloxId explicitamente
    const userWithRank = user as any;

    return {
      token,
      user: {
        id: user.id, // ID interno (1)
        staffId: user.staffId, // ID Público (6002) <--- O QUE FALTAVA
        displayName: user.displayName,
        robloxUsername: user.robloxUsername,
        robloxId: user.robloxId,
        rank: userWithRank.rank?.name || 'Passageiro'
      }
    };
  }
}