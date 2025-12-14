import canchaModel from '../models/canchas.js';

const canchasController = {
  obtenerTodas: async (req, res) => {
    try {
      const canchas = await canchaModel.obtenerTodas();
      res.json(canchas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener las canchas' });
    }
  },

  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const cancha = await canchaModel.obtenerPorId(id);
      
      if (!cancha) {
        return res.status(404).json({ error: 'Cancha no encontrada' });
      }
      
      res.json(cancha);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener la cancha' });
    }
  }
};

export default canchasController;