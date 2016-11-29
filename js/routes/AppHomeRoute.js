import Relay from 'react-relay';

export default class extends Relay.Route{
    static routeName = 'AppHomeRoute';
    static queries = {
        library: (Componenet) => Relay.QL `
            query QuotesLibrary {
                quotesLibrary {
                    ${Componenet.getFragment('library')}
                }
            }
        `
    }
}