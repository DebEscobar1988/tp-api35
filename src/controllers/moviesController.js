const paginate = require('express-paginate');  
const {getAllMovies, getMovieById, createMovie, updateMovie,deleteMovie}= require("../services/movies.services");
const createError =  require('http-errors')
  



const moviesController = {

    list : async (req, res) => {
        try{
            const {movies, total}= await getAllMovies(req.query.limit,req.skip);
            const pagesCount = Math.ceil(total / req.query.limit) /*ceil= redondea el número total , dividido el limite y eso me da número decimal, que redondea a un entero */
            const currentPage = req.query.page; /* pege, tiene un valor númerico que te indica la página actual  */
            const pages = paginate.getArrayPages(req)(pagesCount,pagesCount,currentPage)/*argumentos// mostrame las páginas de a poco = cuatro de cuatro,currentPage=la pagína actual//traeme el array de páginas*/

             return res.status(200).json({
                ok:true,
                meta:{
                  total,
                  pagesCount,
                  currentPage,
                  pages
                },
                data:movies/* data recibe la información de la constante movies */
               
             })
        } catch(error){
            return res.status(error.status || 500).json({
                ok:false,
                status:error.status || 500,
                error:error.message || 'Ups, hubo un error :('
            })
        }
     
    },
    detail:async (req,res)=>{
        try{
          
            const {movie, total}= await getMovieById(req.params.id);
        

             return res.status(200).json({
                ok:true,
                data:movie/* data recibe la información de la constante movies */
               
             })
        } catch(error){
            return res.status(error.status || 500).json({
                ok:false,
                status:error.status || 500,
                error:error.message || 'Ups, hubo un error :('
            })
        }},
        create: async (req,res)=> {
           try {
            const {title,release_date,awards,rating,length,genre_id,actors}= req.body;
           if ([title,release_date, awards,rating].includes('' ||  undefined)){
            
            throw createError(400, 'Los campos title, release_date,awards, rating son obligatorios')
           };/* includes te devuelve un true */

            const newMovie= await createMovie({ 
                title,
                release_date,
                awards,
                rating,
                length,
                genre_id,
            },actors
            );

            return res.status(200).json({
                ok:true,
                msg:'Película creada con éxito',
                url : `${req.protocol}://${req.get('host')}/api/v1/movies/${newMovie.id}` /* protocolo de transferencía */
               
             }); 
           } catch (error) {
            return res.status(error.status || 500).json({
                ok:false,
                status:error.status || 500,
                error:error.message || 'Ups, hubo un error :('
           })

        }
    },
            
        update: async (req,res)=> {
           try {
         
            const movieUpdate = await updateMovie(req.params.id, req.body);
            
            return res.status(200).json({
                ok:true,
                msg:'Película actualizada con éxito',
                url : `${req.protocol}://${req.get('host')}/api/v1/movies/${movieUpdate.id}` /* protocolo de transferencía */
               
             }); 
            
           } catch (error) {
            return res.status(error.status || 500).json({
                ok:false,
                status:error.status || 500,
                error:error.message || 'Ups, hubo un error :('
           })
           }
            },
        destroy: async (req,res) =>{
        try {
            await deleteMovie(req.params.id);
            
            return res.status(200).json({
                ok:true,
                msg:'Película eliminada con éxito',
                
             }); 
            
        } catch (error) {
            return res.status(error.status || 500).json({
                ok:false,
                status:error.status || 500,
                error:error.message || 'Ups, hubo un error :('
           })
        }
        }
     
    }

module.exports = moviesController;