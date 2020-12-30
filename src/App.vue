<template>
  <v-app class="grey lighten-3">
    <v-content>
      <v-container>
        <v-layout
          text-xs-center
          wrap
        >
          <v-flex mb-4>
            <h2 class="">
               EthProxy 🌱 | Latam Crowdfunding 
            </h2>
            <hr/>
            <p class="subheading font-weight-regular">
              Utiliza Ethereum para crowdfunding descentralizado y aprende la dinámica de los criptoactivos<br><br> 
              Instala tu billetera <a href="https://metamask.io" target="_blank">Metamask (Extension Google Chrome)</a> y solicita algunos Eths de prueba<br>
              en <a href="https://faucet.metamask.io/" target="_blank">faucet.metamask.io</a> para realizar tu donación o crear tu propio proyecto en la Testnet Ropsten.  
            </p>
          </v-flex>
        </v-layout>

        <v-layout row justify-center>
          <v-dialog v-model="startProjectDialog" max-width="600px" persistent>
            <v-btn slot="activator" color="primary" dark>Emprende un proyecto</v-btn>
            <v-card>
              <v-card-title>
                <span class="headline font-weight-bold mt-2 ml-4">Emprende tu proyecto</span>
              </v-card-title>
              <v-card-text class="pt-0">
                <v-container class="pt-0" grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12>
                      <v-text-field
                        label="Titulo"
                        persistent-hint
                        v-model="newProject.title">
                      </v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-textarea
                        label="Descripción"
                        persistent-hint
                        v-model="newProject.description">
                      </v-textarea>
                    </v-flex>
                    <v-flex xs12 sm6>
                      <v-text-field
                        label="Cantidad requerida (ETH)"
                        type="number"
                        step="0.0001"
                        min="0"
                        v-model="newProject.amountGoal">
                      </v-text-field>
                    </v-flex>
                    <v-flex xs12 sm6>
                      <v-text-field
                        label="Duración (en dias)"
                        type="number"
                        v-model="newProject.duration">
                      </v-text-field>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  flat
                  @click="startProjectDialog = false;
                  newProject.isLoading = false;">
                  Cerrar
                </v-btn>
                <v-btn color="blue darken-1"
                  flat
                  @click="startProject"
                  :loading="newProject.isLoading">
                  Crear proyecto
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-layout>
        
      </v-container>

      <v-container
        grid-list-lg
      >
        <h2 class="" style="margin-top: -75px;">
          Proyectos en curso
        </h2>
        <v-layout row wrap>
          <v-flex v-for="(project, index) in projectData" :key="index" xs12>
            <v-dialog
              v-model="project.dialog"
              width="800"
            >
              <v-card>
                <v-card-title class="headline font-weight-bold">
                  {{ project.projectTitle }}
                </v-card-title>
                <v-card-text>
                  {{ project.projectDesc }}
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="blue darken-1"
                    flat="flat"
                    @click="projectData[index].dialog = false"
                  >
                    Close
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-hover>
              <v-card
                slot-scope="{ hover }"
                :class="`elevation-${hover ? 10 : 2}`"
              >
                <v-card-title primary-title>
                  <div>
                    <div class="headline font-weight-bold">
                      <v-chip
                        label
                        :color="stateMap[project.currentState].color"
                        text-color="white" class="mt-0">
                      {{ stateMap[project.currentState].text }}
                      </v-chip>
                      {{ project.projectTitle }}
                    </div>
                    <br/>
                    <span>{{ project.projectDesc.substring(0, 100) }}</span>
                    <span v-if="project.projectDesc.length > 100">
                      ... <a @click="projectData[index].dialog = true">[Show full]</a>
                    </span>
                    <br/><br/>
                    <small>Disponible hasta: <b>{{ new Date(project.deadline * 1000) }}</b></small>
                    <br/><br/>
                    <small>Meta: <b>{{ project.goalAmount / 10**18 }} ETH </b></small>
                    <small v-if="project.currentState == 1">wasn't achieved before deadline</small>
                    <small v-if="project.currentState == 2">has been achieved</small>
                  </div>
                </v-card-title>
                <v-flex
                  v-if="project.currentState == 0 && account != project.projectStarter"
                  class="d-flex ml-3" xs12 sm6 md3>
                  <v-text-field
                    label="Cantidad (en ETH)"
                    type="number"
                    step="0.0001"
                    min="0"
                    v-model="project.fundAmount"
                  ></v-text-field>
                  <v-btn
                    class="mt-3"
                    color="light-blue darken-1 white--text"
                    @click="fundProject(index)"
                    :loading="project.isLoading"
                  >
                    Donar
                  </v-btn>
                </v-flex>
                <v-flex class="d-flex ml-3" xs12 sm6 md3>
                  <v-btn
                    class="mt-3"
                    color="amber darken-1 white--text"
                    v-if="project.currentState == 1"
                    @click="getRefund(index)"
                    :loading="project.isLoading"
                  >
                    Obtener reembolso (en ETH)
                  </v-btn>
                </v-flex>
                <v-card-actions v-if="project.currentState == 0" class="text-xs-center">
                  <span class="font-weight-bold" style="width: 200px;">
                    {{ project.currentAmount / 10**18 }} ETH
                  </span>
                  <v-progress-linear
                    height="10"
                    :color="stateMap[project.currentState].color"
                    :value="(project.currentAmount / project.goalAmount) * 100"
                  ></v-progress-linear>
                  <span class="font-weight-bold" style="width: 200px;">
                    {{ project.goalAmount / 10**18 }} ETH
                  </span>
                </v-card-actions>
              </v-card>
            </v-hover>
          </v-flex>
        </v-layout>      
        
        <v-layout
          text-xs-center
          wrap
        >
          <v-flex mb-4>                       
            <p class="subheading font-weight-regular">
             - Los emprendedores no pueden financiar su propio proyecto, es por este motivo que al momento de crear tu proyecto 
             no puedes donar ETH al mismo.<br>
             - Las transacciones a través de tu billetera en Metamask las puedes realizar en la testnet Ropsten lo que significa
             que estas no tienen un costo real.
            </p>
            <p>
             <a href="https://ethproxy.herokuapp.com/ethmath" target="_blank">Calcúla el costo de las transacciones en Ethereum</a>
             |
             <a href="https://ethereum.org/es/" target="_blank">Asesoria personalizada</a>
             |
             <a href="https://ethereum.org/es/" target="_blank">Aprende más sobre Ethereum y arquitecturas web descentralizadas</a>
            </p>
          </v-flex>
        </v-layout> 
        
        <v-layout row justify-left>
          <v-dialog v-model="startProjectDialog2" max-width="600px" persistent>
            <v-btn slot="activator" color="blue darken-1" dark>Motivación 😀🌱🥳 </v-btn>                     
            <v-card>
              <v-card-title>
                <span class="headline font-weight-bold mt-2 ml-4">¿Por qué una aplicación de crowdfunding para Latinoamerica? </span>
              </v-card-title>
              <v-card-text class="pt-0">
                <v-container class="pt-0" grid-list-md>
                  <v-layout wrap>
                  
            Las grandes ideas necesitan esfuerzo y financiación. Puede solicitar donaciones o inversores, pero los donantes, por supuesto, preferirían donar a proyectos en los que tienen algún tipo de certeza de que el proyecto realmente va a alguna parte.
            Aquí es donde entra en juego el crowdfunding, una configuración ideal en la que puede especificar su objetivo y una fecha límite para alcanzarlo. Si no cumple con su objetivo, las donaciones se devuelven, lo que reduce el riesgo para los donantes.
            Las plataformas existentes son todas geniales, pero en cada proyecto completado o en cada donación enviada, la plataforma toma un cierto porcentaje (margen) que podría, en ocasiones, ser demasiado alto para los emprendedores. 
            Es más, dependemos en gran medida de ellos como la tercera parte que nos conecta con los donantes. Si fracasan ellos, también nosotros estaremos en problemas.
            Con una configuración descentralizada, podemos tener una plataforma que no requiere de confianza entre las partes (en lo que se basa el sistema financiero tradicional), por lo tanto, las únicas tarifas que todos pagarán son solo las tarifas del gas <a href="https://ethereum.org/es/" target="_blank">Aprende más sobre Ethereum y arquitecturas web descentralizadas</a>
            
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                
                <v-btn
                  color="blue darken-1" flat @click="startProjectDialog2 = false;">
                  Cerrar
                </v-btn>
                                        
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-layout>   
        
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
// We import our the scripts for the smart contract instantiation, and web3
import crowdfundInstance from '../contracts/crowdfundInstance';
import crowdfundProject from '../contracts/crowdfundProjectInstance';
import web3 from '../contracts/web3';
export default {
  name: 'App',
  data() {
    return {
      startProjectDialog: false,
      startProjectDialog2: true,
      account: null,
      stateMap: [
        { color: 'primary', text: 'En curso' },
        { color: 'warning', text: 'Expired' },
        { color: 'success', text: 'Completed' },
      ],
      projectData: [],
      newProject: { isLoading: false },
    };
  },
  mounted() {
    // this code snippet takes the account (wallet) that is currently active
    web3.eth.getAccounts().then((accounts) => {
      [this.account] = accounts;
      this.getProjects();
    });
  },
  methods: {
    getProjects() {
      crowdfundInstance.methods.returnAllProjects().call().then((projects) => {
        projects.forEach((projectAddress) => {
          const projectInst = crowdfundProject(projectAddress);
          projectInst.methods.getDetails().call().then((projectData) => {
            const projectInfo = projectData;
            projectInfo.isLoading = false;
            projectInfo.contract = projectInst;
            this.projectData.push(projectInfo);
          });
        });
      });
    },
    startProject() {
      this.newProject.isLoading = true;
      crowdfundInstance.methods.startProject(
        this.newProject.title,
        this.newProject.description,
        this.newProject.duration,
        web3.utils.toWei(this.newProject.amountGoal, 'ether'),
      ).send({
        from: this.account,
      }).then((res) => {
        const projectInfo = res.events.ProjectStarted.returnValues;
        projectInfo.isLoading = false;
        projectInfo.currentAmount = 0;
        projectInfo.currentState = 0;
        projectInfo.contract = crowdfundProject(projectInfo.contractAddress);
        this.startProjectDialog = false;
        this.newProject = { isLoading: false };
      });
    },
    fundProject(index) {
      if (!this.projectData[index].fundAmount) {
        return;
      }
      const projectContract = this.projectData[index].contract;
      this.projectData[index].isLoading = true;
      projectContract.methods.contribute().send({
        from: this.account,
        value: web3.utils.toWei(this.projectData[index].fundAmount, 'ether'),
      }).then((res) => {
        const newTotal = parseInt(res.events.FundingReceived.returnValues.currentTotal, 10);
        const projectGoal = parseInt(this.projectData[index].goalAmount, 10);
        this.projectData[index].currentAmount = newTotal;
        this.projectData[index].isLoading = false;
        // Set project state to success
        if (newTotal >= projectGoal) {
          this.projectData[index].currentState = 2;
        }
      });
    },
    getRefund(index) {
      this.projectData[index].isLoading = true;
      this.projectData[index].contract.methods.getRefund().send({
        from: this.account,
      }).then(() => {
        this.projectData[index].isLoading = false;
      });
    },
  },
};
</script>
