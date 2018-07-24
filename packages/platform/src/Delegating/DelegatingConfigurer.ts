import { Configurer } from '../Core';
import { Delegating } from './Delegating';

/**This authentication delegates authentication to an external auth provider.<br>When a zetapush client handshakes with a delegated authentication, the 'token' field given by the client is sent to the configured remote server as part of the URL.<br>The response must be in JSON format. Each key of the response will be considered a user information field name.<br>The handshake from the server will return the primary key in a field named 'login' (regardless of the actual key name you might have chosen)*/
export class DelegatingConfigurer extends Configurer {}
