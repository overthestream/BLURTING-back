import {
  Controller,
  Body,
  Req,
  Res,
  Post,
  UseGuards,
  Query,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { JwtPayload, SignupPayload } from 'src/interfaces/auth';
import { SignupGuard } from './guard/signup.guard';
import { Page } from 'src/common/enums/page.enum';
import { CreateUserDto, LoginDto } from 'src/dtos/createUser.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(SignupGuard)
  @Post('/check/phone')
  async checkCode(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code: string,
    @Body() number: string,
  ) {
    const { id } = req.user as SignupPayload;

    this.authService.checkCode(id, code, number);
    const signupToken = await this.authService.getSignupToken(
      req.user as SignupPayload,
    );

    return res.json({ signupToken: signupToken });
  }

  @Get('/check/email')
  async checkMail(@Query('code') code: string, @Query('email') email: string) {
    await this.authService.checkMail(code, email);
  }
  @UseGuards(SignupGuard)
  @Post('/signup')
  async signup(
    @Req() req: Request,
    @Body() info: CreateUserDto,
    @Res() res: Response,
  ) {
    const { id, infoId, page } = req.user as SignupPayload;
    if (page > 16) {
      // email, phoneNumber 저장
      return res.json({
        refreshToken: await this.authService.getRefreshToken({
          id: id,
        }),
        accessToken: await this.authService.getAccessToken({
          id: id,
        }),
      });
    }

    const pageName = Object.keys(Page).find((key) => Page[key] == page);

    switch (pageName) {
      case 'email':
        this.authService.sendVerificationCode(id, info.email);
        break;
      case 'phoneNumber':
        this.authService.validatePhoneNumber(info.phoneNumber, id);
        break;
      case 'checkPhoneNumber':
        // TODO: err
        break;
      case 'userName':
        this.userService.updateUser(id, 'userName', info['userName']);
        break;
      default:
        this.userService.updateUserInfo(infoId, pageName, info[pageName]);
    }

    const signupToken = await this.authService.getSignupToken(
      req.user as SignupPayload,
    );

    return res.json({ signupToken: signupToken });
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { id } = loginDto;

    const user = await this.authService.validateUser(id);
    const refreshToken = await this.authService.getRefreshToken({
      id: user.id,
    });
    const accessToken = await this.authService.getAccessToken({ id: user.id });
    return res.json({
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
  }

  @UseGuards(AuthGuard('refresh'))
  @Post('/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const { id } = req.user as JwtPayload;
    const accessToken = await this.authService.getAccessToken({ id: id });
    return res.json({
      accessToken: accessToken,
    });
  }
}
