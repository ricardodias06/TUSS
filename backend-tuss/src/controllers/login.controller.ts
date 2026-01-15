import {inject} from '@loopback/core';
import {
  TokenServiceBindings,
} from '@loopback/authentication-jwt';
import {UserProfile, securityId} from '@loopback/security';
import {post, requestBody, response, HttpErrors} from '@loopback/rest';
import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories';
import * as bcrypt from 'bcryptjs';
import {TokenService} from '@loopback/authentication';

export class LoginController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @repository(UserRepository)
    protected userRepository: UserRepository,
  ) {}

  @post('/login')
  @response(200, {
    description: 'Token JWT e dados de utilizador',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {type: 'string'},
            user: {type: 'object'}, // Adicionámos o objeto user aqui
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
    credentials: any,
  ): Promise<{token: string; user: any}> {
    // 1. Procurar o utilizador
    const user = await this.userRepository.findOne({
      where: {robloxUsername: credentials.username},
      // include: [{relation: 'rank'}], // Descomenta se quiseres enviar dados do rank
    });

    if (!user) {
      throw new HttpErrors.Unauthorized('Utilizador não encontrado');
    }

    // 2. Verificar a password
    const passwordMatched = await bcrypt.compare(
      credentials.password,
      user.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Password incorreta');
    }

    // 3. Gerar o Token
    const userProfile: UserProfile = {
      [securityId]: user.id!.toString(),
      name: user.displayName,
      id: user.id,
    };

    const token = await this.jwtService.generateToken(userProfile);

    // 4. Lógica de Adaptação para o Frontend (HUB)
    // O site espera um 'role' (string) mas a DB tem 'rankId' (número).
    let role = 'passenger'; // Valor por defeito

    if (user.rankId === 1) {
      role = 'owner'; // Acesso total
    } else if (user.rankId && user.rankId <= 5) {
      role = 'staff'; // Acesso intermédio
    }

    // Retornamos tudo o que o site precisa para funcionar
    return {
      token,
      user: {
        ...user,
        role: role, // O campo mágico que ativa o Backoffice no site
        email: user.robloxUsername + "@tuss.pt" // Fake email para compatibilidade
      }
    };
  }
}