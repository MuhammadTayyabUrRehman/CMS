import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { LookupService } from './service';
import { LookupItem } from './constants';

@ApiTags('Lookup')
@Controller('lookup')
export class LookupController {
  constructor(private readonly lookupService: LookupService) {}

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'List complaint categories' })
  getCategories(): LookupItem[] {
    return this.lookupService.getCategories();
  }

  @Public()
  @Get('contact-methods')
  @ApiOperation({ summary: 'List contact methods' })
  getContactMethods(): LookupItem[] {
    return this.lookupService.getContactMethods();
  }

  @Public()
  @Get('ranks')
  @ApiOperation({ summary: 'List employee ranks' })
  getRanks(): LookupItem[] {
    return this.lookupService.getRanks();
  }

  @Public()
  @Get('blocks')
  @ApiOperation({ summary: 'List building blocks' })
  getBlocks(): LookupItem[] {
    return this.lookupService.getBlocks();
  }

  @Public()
  @Get('statuses')
  @ApiOperation({ summary: 'List complaint statuses' })
  getStatuses(): LookupItem[] {
    return this.lookupService.getStatuses();
  }
}
