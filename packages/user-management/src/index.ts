import { Module, ZetaPushContext, ConfigurationProperties } from '@zetapush/core';
import { DefaultUserWorkflowConfigurer } from './standard-user-workflow/configurer';
import { HttpServerModule } from '@zetapush/http-server';

export * from './common/api';
export * from './common/configurer';
export * from './common/core';
export * from './standard-user-workflow/api';
export * from './standard-user-workflow/configurer';
export * from './standard-user-workflow/core';
export * from './standard-user-workflow/legacy';

@Module({
  imports: [HttpServerModule],
  configurers: [DefaultUserWorkflowConfigurer]
})
export class StandardUserManagementModule {}
