describe("API - Mudar Status", () => {
  it("Mudar Status do Pedido de Venda", () => {

    const proximoStatus = "EmTransito"; // Defina o próximo status desejado

    cy.readFile("cypress/fixtures/informacoes_pedido.json").then((dados) => {
      const pedidoId = dados.body[0].pedidoId;
      cy.log("Pedido ID:", pedidoId); // Id do pedido criado anteriormente

      const user = Cypress.env("user");
      const key = Cypress.env("key");

      cy.request({
        method: "POST",
        url: `/${pedidoId}/atualizarStatus/${proximoStatus}`,
        headers: { "x-api-key": key, "x-api-username": user },

        body: {
          usuario: "login.usuario",
          dados: {
            autorizado: 1,
            motivoReprovacao: "Realizado o cancelamento, pois foi feito a solicitação por engano",
          },
        },
      }).then((response) => {
        switch (response.status) {
          case 200:
            expect(response.body).to.have.property("pedidoId");
            expect(response.body.pedidoId).to.eq(pedidoId); // Verifica se o ID do pedido corresponde ao esperado
            cy.log("Status atualizado com sucesso para:", proximoStatus);
            break;
            
          case 403:
            // Erro de acesso negado
            cy.log(response.body.message);
            break;

          case 500:
            // Erro de processamento
            cy.log(response.body.message);
            break;

          default:
            throw new Error(`Status inesperado: ${response.status}`);
        }
      });
    });
  });
});
