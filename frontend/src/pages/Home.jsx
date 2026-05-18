import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import CardServico from '../components/CardServico';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <HeroSection />
            
            <div className="container py-5">
                <div className="row g-4">
                    <div className="col-md-3 col-sm-6">
                        <CardServico 
                            icone="bi-ticket-detailed" 
                            titulo="Abertura de Chamados" 
                            descricao="Registre solicitações de manutenção com facilidade e acompanhe o status em tempo real." 
                        />
                    </div>
                    <div className="col-md-3 col-sm-6">
                        <CardServico 
                            icone="bi-clipboard2-data" 
                            titulo="Auditoria de Logs" 
                            descricao="Tenha controle total com um histórico detalhado de todas as ações realizadas no sistema." 
                        />
                    </div>
                    <div className="col-md-3 col-sm-6">
                        <CardServico 
                            icone="bi-qr-code-scan" 
                            titulo="Selos QR de Garantia" 
                            descricao="Gere e leia QR Codes para gerenciar as garantias de equipamentos de forma ágil e prática." 
                        />
                    </div>
                    <div className="col-md-3 col-sm-6">
                        <CardServico 
                            icone="bi-headset" 
                            titulo="Suporte Especializado" 
                            descricao="Conte com ferramentas dedicadas que otimizam o atendimento da sua equipe técnica." 
                        />
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Home;