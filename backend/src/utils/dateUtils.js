// Código para resolver problema de horarios entre servidor - posgresql y equipo local

/**
 * Formatea una fecha TIMESTAMPTZ a string legible en hora Argentina
 * Ejemplo: "16/12/2025, 22:16:47"
 */
export const formateoFechaHorarioLocal = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    };

    /**
     * Formatea solo la fecha (sin hora)
     * Ejemplo: "16/12/2025"
     */
    export const formateoFechaLocal = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};