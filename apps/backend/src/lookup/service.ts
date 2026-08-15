import { Injectable } from '@nestjs/common';
import { Category, ContactMethod, Status } from '@prisma/client';
import { BLOCKS, LookupItem, RANKS } from './constants';

@Injectable()
export class LookupService {
  getCategories(): LookupItem[] {
    return Object.values(Category).map((value) => ({ value, label: toLabel(value) }));
  }

  getContactMethods(): LookupItem[] {
    return Object.values(ContactMethod).map((value) => ({ value, label: toLabel(value) }));
  }

  getStatuses(): LookupItem[] {
    return Object.values(Status).map((value) => ({ value, label: toLabel(value) }));
  }

  getRanks(): LookupItem[] {
    return RANKS;
  }

  getBlocks(): LookupItem[] {
    return BLOCKS;
  }
}

function toLabel(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}
