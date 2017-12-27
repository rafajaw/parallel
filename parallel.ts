/*
 * Usage
 * 

parallel( (done:Function) => {
    setTimeout( () => { done('Eita'); }, 5000 );
}).parallel( (done:Function) => {
    setTimeout( () => { done('got this'); }, 1000 );
}).parallel( (done:Function) => {
    done('got that other');
}).parallel( (done:Function) => {
    setTimeout( () => { done('yey'); }, 3000 );
}).when_one_completes( (ones_result, ones_index) => {
    console.log(`${ones_result} @${ones_index}\n`);
}).when_all_completes( (results:Array<any>) => {
    console.log(`All completed! results.length = ${results.length} / results = ${JSON.stringify(results)}\n`);
});

*/

class XSyncObj {
    empty:Object;
    results:Array<Object>; // Array of results in order of calling of each .parallel( ) block.
    completeds:Array<boolean>; // Array in order with results to signal if the parallel function is completed. Can you think of a better name?
    when_one_completes_callback:Function;
    when_all_completes_callback:Function;

    constructor( entry:Function ) {
        this.results = new Array<Object>();
        this.completeds = new Array<boolean>();
        this.empty = new Object();
        this.parallel( entry );
    }

    public parallel = function( parallel_func:Function ):XSyncObj {
        this.results.push( this.empty ); // Reserve a slot in an indexed order.
        this.completeds.push( false );
        let parallel_index = this.results.length - 1;
        parallel_func( (param1) => {

            this.results[ parallel_index ] = param1;
            this.completeds[ parallel_index ] = true;
            
            if( this.when_one_completes_callback ) {
                this.when_one_completes_callback( param1, parallel_index );
            }
    
            if( this.when_all_completes_callback && this.did_all_complete() ) {
                this.when_all_completes_callback( this.results );
            }

        });
        return this;
    }

    public did_all_complete( ):boolean {
        for( let i = 0 ; i < this.results.length ; i++ ) {
            if( this.results[i] == this.empty ) { break; }
            if( i == this.results.length - 1 ) {
                return true;
            }
        }
        return false;
    }

    public when_one_completes = function( when_one_completes_callback:Function ):XSyncObj {
        for( let i = 0 ; i < this.results.length ; i++ ) {
            if( this.results[i] != this.empty ) {
                when_one_completes_callback( this.results[i], i );
            }
        }

        this.when_one_completes_callback = when_one_completes_callback;

        return this;
    }

    public when_all_completes = function( when_all_completes_callback:Function ):XSyncObj {
        if( this.did_all_complete() ) {
            when_all_completes_callback( this.results );
        }
        else {
            this.when_all_completes_callback = when_all_completes_callback;
        }

        return this;
    }

};


export default function parallel( entry:Function ):XSyncObj {
    return new XSyncObj( entry );
}

