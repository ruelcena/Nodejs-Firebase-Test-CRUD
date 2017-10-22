(function($){

    $(document).ready(function(){

    $('.ac-delete').click(function(){
        if ( !confirm('Do you want to delete this record? This cannot be undo.') ) {
            return false;
        }
    });

    });

})(jQuery);

//VueJS

new Vue({
    el: '#todos',
    data: {
      todo : '',
      todos : [ { task: 'First todo' } ]      
    },
    
    methods: {
        addTodo: function() {

            var params = new URLSearchParams(), t = this;
            params.append('todo', this.todo);
            axios.post('/todos/list/' + $('#devId').val(), params ).then(function(){
                t.todosLoad();
                t.todo = null;
            });

        },
        delTodo: function(idx) {
            var t = this;

            if ( confirm('Do you want to delete this todo?') ) {

            axios.post('/todos/del/' + $('#devId').val() + '/' + idx, {} )
            .then(function (response) {
                t.todosLoad();
            })
            .catch(function (error) {
                console.log(error);
              });

            }

        },
        todosLoad: function() {
            var t = this;
            //Getting todos
            axios.get('/todos/list/' + $('#devId').val())
            .then(function (response) {
              t.todos = response.data;
            })
            .catch(function (error) {
              console.log(error);
            });
        }
    },
    computed: {
    //nothing
    },
    mounted() {
    this.todosLoad();
    }//mounted
});