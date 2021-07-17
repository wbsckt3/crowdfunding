<template>
  <v-app class="grey lighten-3">
    <v-content>
    
      <v-container>
        <v-layout text-xs-center wrap>
          <v-flex mb-4>
            <h2 class="" style="margin-top: -20px; padding-top: 20px;">
               InstaCrypt 🌱 | Prototipo funcional de aplicación descentralizada para contratos inteligentes en Ethereum  
            </h2>
            <hr/>
            <p class="subheading font-weight-regular"> 
            </p>
          </v-flex>
        </v-layout>       
      </v-container>

      <v-container grid-list-lg>
        <h3 class="" style="margin-top: -75px;"> Bloques generados a partir del contrato contenedor : <b>0x8CfAc34881D1ceFc125e87EaB1Cd95d6Ca3fd789</b> </h3>
        <v-layout row flex>
          <v-flex v-for="(project, index) in projectData" :key="index" xs4>
            <v-dialog v-model="project.dialog" width="800">
              <v-card>
                <v-card-title class="headline font-weight-bold"> {{ project.projectTitle }} </v-card-title>
                <v-card-text> {{ project.projectDesc }} </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" flat="flat" @click="projectData[index].dialog = false"> Cerrar </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-hover>
              <v-card slot-scope="{ hover }" :class="`elevation-${hover ? 10 : 2}`">
                <v-card-title primary-title>
                  <div>
                    <div class="headline font-weight-bold">
                      <v-chip label :color="stateMap[project.currentState].color" text-color="white" class="mt-0">
                         {{ stateMap[project.currentState].text }}
                      </v-chip>
                      {{ project.projectTitle }}
                    </div>
                    <br/>
                     <span><b>Cuenta que crea el bloque:</b> {{ project.projectStarter }} </span>
                    <br/>
                      <span><b>Contrato del bloque:</b> {{ project.contract._address }}</span>
                    <br/><br/>
                    <span>{{ project.projectDesc.substring(0, 100) }}</span>
                    <span v-if="project.projectDesc.length > 100"> ... <a @click="projectData[index].dialog = true">[Show full]</a> </span>
                    <br/><br/>
                    <small>Licitación disponible hasta: <b>{{ new Date(project.deadline * 1000) }}</b></small>
                    <br/><br/>
                    <small>Meta: <b>{{ project.goalAmount / 10**18 }} ETH </b></small>
                    <small v-if="project.currentState == 1">Esta licitación no se logró antes de la fecha límite por tal motivo los fondos retornan a sus aportantes</small>
                    <small v-if="project.currentState == 2">Esta licitación logró recaudar los fondos necesarios</small>
                  </div>
                </v-card-title>
                <v-flex v-if="project.currentState == 0 && account != project.projectStarter" class="d-flex ml-3" xs12 sm6 md3>
                  <v-text-field label="Cantidad (en ETH)" type="number" step="0.0001" min="0" v-model="project.fundAmount"></v-text-field>
                  <v-btn class="mt-3" color="light-blue darken-1 white--text" @click="fundProject(index)" :loading="project.isLoading">
                    Transferir
                  </v-btn>
                </v-flex>
                <v-flex class="d-flex ml-3" xs12 sm6 md3>
                  <v-btn class="mt-3" color="amber darken-1 white--text" v-if="project.currentState == 1" @click="getRefund(index)" :loading="project.isLoading">
                    Obtener reembolso (en ETH)
                  </v-btn>
                </v-flex>
                <v-card-actions v-if="project.currentState == 0" class="text-xs-center">
                  <span class="font-weight-bold" style="width: 200px;"> {{ project.currentAmount / 10**18 }} ETH </span>
                  <v-progress-linear height="10" :color="stateMap[project.currentState].color" :value="(project.currentAmount / project.goalAmount) * 100"> </v-progress-linear>
                  <span class="font-weight-bold" style="width: 200px;"> {{ project.goalAmount / 10**18 }} ETH </span>
                </v-card-actions>
              </v-card>
            </v-hover>
          </v-flex>
        </v-layout>      
        
        <v-layout row justify-center>
          <v-dialog v-model="startProjectDialog" max-width="600px" persistent>
            <v-btn slot="activator" color="primary" dark>Generar un nuevo bloque a partir del contrato contenedor</v-btn>
            <v-card>
              <v-card-title>
                <span class="headline font-weight-bold mt-2 ml-4">Genera un nuevo bloque</span>
              </v-card-title>
              <v-card-text class="pt-0">
                <v-container class="pt-0" grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12>
                      <v-text-field label="Titulo" persistent-hint v-model="newProject.title"> </v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-textarea label="Descripción" persistent-hint v-model="newProject.description"> </v-textarea>
                    </v-flex>
                    <v-flex xs12 sm6>
                      <v-text-field label="Cantidad requerida (ETH)" type="number" step="0.0001" min="0" v-model="newProject.amountGoal"> </v-text-field>
                    </v-flex>
                    <v-flex xs12 sm6>
                      <v-text-field label="Duración (en dias)" type="number" v-model="newProject.duration"> </v-text-field>
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
        
        
        
        <v-layout
          text-xs-center
          wrap
        >
          <v-flex mb-4>   <hr/>                    
            <p><a href="https://defimath.herokuapp.com" target="_blank">Calcúla el costo de las transacciones en Ethereum</a> <br> 
            <a href="https://metamask.io" target="_blank">Obtener Metamask | billetera digital (Extension para Chrome o Firefox)</a> <br>
            <a href="https://faucet.ropsten.be/" target="_blank">Obtener ethers de pruebaen un grifo | faucet.ropsten.be </a> <br>                                                      
            <a href="https://www.buda.com" target="_blank">www.buda.com | Banco de criptoactivos latinoamérica SurBTC</a> <br>                   
            <a href="https://ropsten.etherscan.io/address/0x15d88d19b7aab3fcbf9e721fd64f9de14c98c61b" target="_blank">
                      Etherscan | Visualizar Transacciones sobre los contratos o desde cuentas públicas</a> <br>                    
            <a href="https://gobiernodigital.mintic.gov.co/692/articles-161810_Ley_2052_2020.pdf" target="_blank">Guía adopción de proyectos sobre Blockchain para Colombia</a>
            </p>  <hr/>
          </v-flex>
        </v-layout> 
        
        <v-layout row justify-left style="">
          
          <v-dialog v-model="startProjectDialog2" max-width="1000px" persistent>
            <v-btn slot="activator" color="blue darken-1" dark>Generalidades</v-btn>
            <v-card>
              <v-card-title>                
                <p class="subheading font-weight-regular">
                   <span class="headline font-weight-bold mt-2 ml-4">Generalidades</span>
                </p>
              </v-card-title>
              
              <v-card-text class="pt-0">
                <v-container class="pt-0" grid-list-md>
                  <v-layout wrap>
                  
                    - Todo request desde y hacia Ethereum es una transacción<br>
                    - Visualizar las transacciones que generaron los bloques (GET) desde las dirección públicas (billetera) es gratuito en ropsten.etherscan.io<br>
                    - Visualizar el contenido de los bloques (GET) es gratuito y privado por pertenencia del contrato contenedor<br>
                    - Generar un contrato contenedor (POST) y generar bloques dependientes de ese contrato tiene costo<br>
                    - No es posible modificar o eliminar los contratos generados i.e. los bloques<br><br>
                  
                   El navegador que crea un bloque no puede financiar su propio bloque, es por este motivo que al momento de crear tu proyecto 
                   no puedes consignar Ether al mismo.<br><br>
                   
                   Esta Dapp (Aplicación descentralizada sin base de datos) utiliza contratos inteligentes con Solidity para generar bloques sobre el blockchain de Ethereum en una Testnet<br><br> 
                                      
                   Las transacciones a través de la billetera Metamask se realizan libremente en la red Ropsten (TestNet) con Ether de prueba
                   lo que significa que estas no tienen incidencia en la red productiva de Ethereum (MainNet) con Ether real. <br><br>                                                                   
                                         
                      Para realizar transacciones en una testnet se requiere una dirección blockchain pública (semejante a una cuenta de banco) y una semilla privada
                      en el navegador del usuario (una billetera)<br><br>
                      
                      Solicitar Eths de prueba en un grifo de Ether gratis como faucet.ropsten.be para crear un bloque o consignar a uno en la Testnet Ropsten. 
                      (Se puede obtener un ETH de prueba cada 24 horas desde la Ip del navegador).<br><br>                                                            
                      
                      Para comprar ETH real existe www.buda.com, primer Banco digital de criptoactivos</a> de una compañia llamada surBTC basada en Chile
                      (activa en Chile, Perú, Argentina y Colombia). <br><br>                  
                      
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

<template>
  <div id="app">
    <div style="display: flex; flex-direction: column;">
      <!-- Upload Interface -->
      <div id="upload">
        <div v-if="this.$root.$data.loading === false">
          <h1>Post Here!</h1>
          <h4>share your memories.</h4>

          <!-- Form for file choose, caption text and submission -->
          <form
            class="margin-sm"
            @submit.stop.prevent="handleSubmit"
          >
            <div class="border-style">
              <b-form-file
                plain
                @change="captureFile"
              />
            </div>
            <b-form-textarea
              v-model="caption"
              placeholder="Post description"
              :rows="3"
              :max-rows="6"
              class="margin-xs"
            />
            <b-button
              class="margin-xs"
              variant="secondary"
              @click="handleOk"
            >
              Upload
            </b-button>
          </form>
        </div>
        <div
          v-if="this.$root.$data.loading === true"
          style="margin-top: 10%; margin-bottom: 5%"
        >
          <img
            class="upload-load"
            src="https://media.giphy.com/media/2A6xoqXc9qML9gzBUE/giphy.gif"
          >
        </div>
      </div>

      <!-- Posts Interface -->
      <ul class="home-list">
        <li
          v-for="item in this.$root.$data.currentPosts"
          :key="item.key"
          :item="item"
        >
          <!-- Card UI for post's image & caption text -->
          <b-card
            border-variant="secondary"
            :img-src="item.src"
          >
            <p class="home-card-text">
              {{ item.caption }}
            </p>
          </b-card>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
// We import our the scripts for the smart contract instantiation, and web3
import crowdfundInstance from '../contracts/crowdfundInstance';
import crowdfundProject from '../contracts/crowdfundProjectInstance';
import storeNumberInstance from '../contracts/storeNumberInstance';
import instagramPostingInstance from '../contracts/instagramPostingInstance';
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
        { color: 'warning', text: 'Expirado' },
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
      this.coolNumber();
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
    coolNumber(){
     const coolNumber = storeNumberInstance.methods.coolNumber().call();
     console.log(coolNumber);
    }
  },
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  justify-content: center;
  color: #2c3e50;
  margin-top: 3%;
}
.home-load {
  width: 50px;
  height: 50px;
}
.card img {
  object-fit: cover;
  height: 500px;
  width: 500px;
}
.card {
  text-align: left;
  width: 500px;
  margin-bottom: 20px;
}
.home-list{
  padding: 0;
  list-style: none;
}
.home-card-text {
  text-align: justify;
  margin-top: 10px;
}
#upload {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-bottom: 5%;
  width: 500px;
}
.upload-load {
  width: 50px;
  height: 50px;
}
.margin-xs {
  margin-top: 3%;
}
.margin-sm {
  margin-top: 7%;
}
.border-style {
  border: 1px solid #ced4da;
}
</style>
