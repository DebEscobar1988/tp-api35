const db = require("../database/models");
const createError = require("http-errors");

const getAllMovies = async (limit, offset) => {
  try {
    const movies = await db.Movie.findAll({
      limit,
      offset,
      attributes: {
        exclude: [
          "created_at",
          "update_at",
          "genre_id",
        ] /* excluye las columnas */,
      },
      include: [
        {
          association: "genre",
          attributes: ["id", "name"],
        },
        {
          association: "actors",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });
    const total =
      await db.Movie.count(); /* count trae la cantida de elementos */
    return {
      movies,
      total,
    };
  } catch (error) {
    console.log(error);
    throw {
      status: error.status || 500,
      message: error.message || "Ups, error",
    };
  }
};
const getMovieById = async (id) => {
  try {
    if (!id) throw createError(400, "ID inexistente");

    const movie = await db.Movie.findByPk(id, {
      attributes: {
        exclude: [
          "created_at",
          "update_at",
          "genre_id",
        ] /*se excluyen las columnas */,
      },
      include: [
        {
          association: "genre",
          attributes: ["id", "name"],
        },
        {
          association: "actors",
          attributes: ["id", "first_name", "last_name"],
          through: {
            attributes:
              [] /* para evitar que me traiga los valores de la tabla intermedia(actor_movie) */,
          },
        },
      ],
    });
    if (!movie) throw createError(404, "No existe una pelicula con ese ID");

    return {
      movie,
    };
  } catch (error) {
    console.log(error);
    throw {
      status: error.status || 500,
      message: error.message || "Ups, error",
    };
  }
};
const createMovie = async (dataMovie, actors) => {
  try {
    const newMovie = await db.Movie.create(dataMovie);
    if (actors) {
      const actorsDB = actors.map((actor) => {
        return {
          movie_id: newMovie.id,
          actor_id: actor,
        };
      });
      await db.Actor_Movie.bulkCreate(actorsDB, {
        validate: true,
      });
    }
    return newMovie;
  } catch (error) {
    throw {
      status: error.status || 500,
      message: error.message || "Ups, error",
    };
  }
};
const updateMovie = async (id, dataMovie) => {
  try {
    const { title, awards, rating, length, release_date, genre_id, actors } =
      dataMovie;

    const movie = await db.Movie.findByPk(id);

    movie.title = title || movie.title;
    movie.awards = awards || movie.awards;
    movie.rating = rating || movie.rating;
    movie.length = length || movie.length;
    movie.release_date = release_date || movie.release_date;
    movie.genre_id = genre_id || movie.genre_id;

    await movie.save(); /* salva los datos actualizados */

    if (actors) {
      await db.Actor_Movie.destroy({
        where: {
          movie_id: id,
        },
      });
      const actorsArray = actors.map((actor) => {
        return {
          movie_id: id,
          actor_id: actor,
        };
      });
      await db.Actor_Movie.bulkCreate(actorsArray, {
        validate: true,
      });
    }
    return null;
  } catch (error) {
    throw {
      status: error.status || 500,
      message: error.message || "Ups, error",
    };
  }}
  const deleteMovie = async (id) => {
    try {
       await db.Actor_Movie.destroy({
        where: {
          movie_id : id
        }
       })

      const movie = await db.Movie.findByPk(id);
      await movie.destroy();
      return null;
    } catch (error) {
      throw {
        status: error.status || 500,
        message: error.message || "Ups, error",
      };
    }
  };

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
