import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
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
import {inject, service} from '@loopback/core';
import {GoogleSheetsService} from '../services/google-sheets.service';

export class UserController {
  
  constructor(
    @repository(UserRepository)
    public userRepository : UserRepository,
    @service(GoogleSheetsService) 
    public googleSheetsService: GoogleSheetsService,
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
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    const salt = genSaltSync(10);
    user.password = hashSync(user.password, salt);
    return this.userRepository.create(user);
  }

  @post('/users/login')
  @response(200, {
    description: 'Token de Acesso',
    content: {'application/json': {schema: {type: 'object'}}},
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {type: 'string'},
              password: {type: 'string'},
            },
          },
        },
      },
    })
    credentials: {email: string; password: string},
  ): Promise<object> {
    const user = await this.userRepository.findOne({
      where: {email: credentials.email},
    });

    if (!user) {
      throw new HttpErrors.Unauthorized('Email ou password errados');
    }

    const passwordIsValid = compareSync(credentials.password, user.password);

    if (!passwordIsValid) {
      throw new HttpErrors.Unauthorized('Email ou password errados');
    }

    const token = sign(
      {id: user.id, email: user.email, role: user.role},
      'segredo_super_secreto', 
      {expiresIn: '8h'}
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

  @post('/users/sync')
  async syncStaff(): Promise<object> {
    const staffList = await this.googleSheetsService.getStaffData();
    let createdCount = 0;
    let updatedCount = 0;

    // --- DEBUG START ---
    console.log("========================================");
    console.log("TOTAL LINHAS ENCONTRADAS:", staffList.length);
    if (staffList.length > 0) {
        // Correção aqui: (staffList[0] as object)
        console.log("CABEÇALHOS (COLUNAS) DETETADOS:", Object.keys(staffList[0] as object));
        console.log("EXEMPLO DA 1ª LINHA:", staffList[0]);
    } else {
        console.log("ERRO: A lista veio vazia! Verifique o link do CSV.");
    }
    console.log("========================================");
    // --- DEBUG END ---

    for (const rowItem of staffList) {
      const row = rowItem as any;
      
      const username = row['Username'] || row['Name'] || row['Nome'] || row['Motorista'] || row['Driver']; 
      const rank = row['Rank'] || row['Cargo'] || row['Posto'] || row['Role'];

      if (!username) continue; 

      const email = `${username.replace(/\s+/g, '').toLowerCase()}@tuss.pt`;
      const defaultPassword = hashSync('tuss2026', 10);

      let role = 'staff';
      if (rank && (rank.includes('Admin') || rank.includes('Owner') || rank.includes('HR'))) {
        role = 'highrank';
      }

      const existingUser = await this.userRepository.findOne({where: {email}});

      if (existingUser) {
        await this.userRepository.updateById(existingUser.id, {
          robloxUsername: username,
          role: role
        });
        updatedCount++;
      } else {
        await this.userRepository.create({
          email: email,
          password: defaultPassword, 
          robloxUsername: username,
          role: role,
          status: 'active'
        });
        createdCount++;
      }
    }

    return {
      message: 'Sincronização concluída!',
      created: createdCount,
      updated: updatedCount,
      totalProcessed: staffList.length
    };
  }

  @get('/users/count')
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  @get('/users')
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    const count = await this.userRepository.count(filter?.where);
    
    const total = count.count;
    const lastIndex = total > 0 ? total - 1 : 0;
    
    this.response.set('Access-Control-Expose-Headers', 'Content-Range');
    this.response.set('Content-Range', `users 0-${lastIndex}/${total}`);
    
    return this.userRepository.find(filter);
  }

  @get('/users/{id}')
  async findById(@param.path.string('id') id: string): Promise<User> {
    return this.userRepository.findById(id);
  }

  @patch('/users/{id}')
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() user: User,
  ): Promise<void> {
    if(user.password) {
      user.password = hashSync(user.password, 10);
    }
    await this.userRepository.updateById(id, user);
  }

  @del('/users/{id}')
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }
}
