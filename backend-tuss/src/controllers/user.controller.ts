import {
  Count,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  del,
  requestBody,
  response,
  HttpErrors,
  RestBindings,
  Response,
} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {genSaltSync, hashSync, compareSync} from 'bcryptjs';
import {sign} from 'jsonwebtoken';
import {inject} from '@loopback/core';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository : UserRepository,
    @inject(RestBindings.Http.RESPONSE) public response: Response,
  ) {}

  @post('/users')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {title: 'NewUser', exclude: ['id']}),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({where: {email: user.email}});
    if (existingUser) {
      throw new HttpErrors.Conflict('USER_EMAIL_EXISTS'); 
    }
    
    const salt = genSaltSync(10);
    user.password = hashSync(user.password, salt);
    return this.userRepository.create(user);
  }

  @post('/users/login')
  @response(200, {
    description: 'Login Token',
    content: {'application/json': {schema: {type: 'object'}}},
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {email: {type: 'string'}, password: {type: 'string'}},
          },
        },
      },
    })
    credentials: {email: string; password: string},
  ): Promise<object> {
    const user = await this.userRepository.findOne({where: {email: credentials.email}});

    if (!user) {
      throw new HttpErrors.Unauthorized('AUTH_INVALID_CREDENTIALS');
    }

    const passwordIsValid = compareSync(credentials.password, user.password);
    if (!passwordIsValid) {
      throw new HttpErrors.Unauthorized('AUTH_INVALID_CREDENTIALS');
    }

    const token = sign(
      {id: user.id, email: user.email, role: user.role},
      'tuss_secret_key_2026', 
      {expiresIn: '24h'}
    );

    return {
      token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        robloxUsername: user.robloxUsername
      }
    };
  }

  @get('/users')
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @get('/users/{id}')
  async findById(@param.path.string('id') id: string): Promise<User> {
    return this.userRepository.findById(id);
  }

  @patch('/users/{id}')
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              robloxUsername: {type: 'string'},
              email: {type: 'string'},
              password: {type: 'string'},
              role: {type: 'string'},
              status: {type: 'string'},
            },
          },
        },
      },
    })
    user: any,
  ): Promise<object> {
    if (Object.keys(user).length === 0) {
        throw new HttpErrors.BadRequest('UPDATE_NO_DATA');
    }

    if (user.email) {
        const userWithEmail = await this.userRepository.findOne({where: {email: user.email}});
        if (userWithEmail && userWithEmail.id !== id) {
            throw new HttpErrors.Conflict('USER_EMAIL_EXISTS');
        }
    }

    if(user.password) {
      user.password = hashSync(user.password, 10);
    }

    await this.userRepository.updateById(id, user);
    return { success: true };
  }

  @del('/users/{id}')
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }
}
