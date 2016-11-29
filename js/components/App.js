import React, {Component} from 'react';
import Quote from './Quote';
import 'whatwg-fetch';
import Relay from 'react-relay';
import { debounce } from 'lodash';
import SearchForm from './search-form';
import Navbar from './navbar'
import Jumbotron from './jumbotron'

class QuotesLibrary extends React.Component {
    constructor(props) {
        super(props);
        this.search = debounce(this.search.bind(this), 300);
    }
    search(searchTerm) {
        this.props.relay.setVariables({searchTerm});
    }
    render() {
        return (
            <div className="quotes-library">
                <Navbar/>
                <div className="container quotes-list">
                    <Jumbotron/>
                    <SearchForm searchAction={this.search} />
                    {this.props.library.quotesConnection.edges.map(edge =>
                        <Quote key={edge.node.id} quote={edge.node} />
                    )}
                </div>
            </div>
        )
    }
}

QuotesLibrary = Relay.createContainer(QuotesLibrary, {
    initialVariables: {
        searchTerm: ''
    },
    fragments: {
        library: () => Relay.QL `
 fragment on QuotesLibrary {
 quotesConnection(first: 100, searchTerm: $searchTerm) {
 edges {
 node {
 id
 ${Quote.getFragment('quote')}
 }
 }
 }
 }
 `
    }
});
export default QuotesLibrary




