const CardServico = ({ icone, titulo, descricao }) => {
    return (
        <div className="card shadow-sm h-100 border-0 p-3 text-center">
            <div className="card-body d-flex flex-column align-items-center">
                <div className="mb-3">
                    <i className={`bi ${icone} display-4 text-primary`}></i>
                </div>
                <h5 className="card-title fw-bold mb-3">{titulo}</h5>
                <p className="card-text text-muted mb-0">{descricao}</p>
            </div>
        </div>
    );
};

export default CardServico;