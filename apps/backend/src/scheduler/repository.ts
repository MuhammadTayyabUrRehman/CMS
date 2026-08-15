// Scaffold repository for scheduler module - no implementation required.
// The prior session-cleanup helper was removed together with the dead
// AuthSession model (authentication is stateless JWT).
import { Injectable } from '@nestjs/common';

@Injectable()
export class SchedulerRepository {}
