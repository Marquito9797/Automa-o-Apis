import dayjs from "dayjs";
const hoje = dayjs().format("DD-MM-YYYY");

describe("API Pedido de Venda", () => {
  it("Criar Pedido de Venda", () => {
    const key = Cypress.env("key"); // Obtém a chave da variável de ambiente
    const user = Cypress.env("user"); // Obtém o usuário da variável de ambiente

    cy.log("Criando Pedido de Venda com usuário:", user);

    cy.request({
      method: "POST",
      url: "/abrir",
      headers: {
        "x-api-key": key,
        "x-api-username": user,
      },
      body: {
        empresaId: 1,
        filialId: 1,
        solicitanteId: 1,
        localEstoqueId: 1,
        dataRequisicao: hoje,
        usuario: user,
        clienteId: 1,
        endereco: {
          cep: "",
          uf: "SP",
          cidade: "São Paulo",
          bairro: "",
          logradouro: "",
          tipoLogradouroId: 1,
          numeroLogradouro: 1,
        },
        vencimentoEm: 1,
        tipoPedidoId: 1,
        pedidoItem: [
          {
            produtoId: 1,
            quantidade: 10,
            descontoValor: 0,
            valorUnitario: 500,
            unidadeMedidaId: 1,
            validaNumeroSerie: 1,
            validaDigitoVerificador: 1,
            tipoMovimento: "Venda",
          },
        ],
        notaFiscal: {
          // Dados da nota fiscal podem ser fictícios pois não há validaçao
          numero: "12345",
          serie: "1",
          dataEmissao: "15/08/2025",
        },
      },
    }).then((response) => {
      switch (response.status) {
        case 200:
          expect(response.body.confirmados).to.have.length(1); // Verifica se um pedido foi criado
          const pedidoId = response.body.confirmados[0].pedidoId; // Obtém o ID do pedido criado e salva em uma variável
          cy.log("Pedido criado com ID:", pedidoId); // Log do ID do pedido criado

          // Consultar o pedido criado
          cy.log("Consultando pedido com ID:", pedidoId);
          cy.request({
            method: "POST",
            url: "/buscar",
            headers: {
              "x-api-key": key,
              "x-api-username": user,
            },
            body: {
              listaPedidoId: pedidoId,
            },
          }).then((response2) => {
            expect(response2.status).to.eq(200);
            cy.log("Validar Situação:", response2.body[0].situacao); // Verificar a situação do pedido
            cy.writeFile("cypress/fixtures/informacoes_pedido.json"); // Salvar as informações do pedido em um arquivo JSON
            cy.log("Pedido salvo em fixtures como 'informacoes_pedido.json'");
          });
          break;

        case 403:
          // Erro de acesspo negado
          cy.log(response.body.message);
          break;

        case 500:
          // Erro de processamemnto
          cy.log(response.body.message);
          break;

        default:
          throw new Error(`Status inesperado: ${response.status}`);
      }
    });
  });
});
