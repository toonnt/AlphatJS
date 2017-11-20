const Command = require('./command');
const { Message, OpType, Location, Profile } = require('../curve-thrift/line_types');

class LINE extends Command {
    constructor() {
        super();
        this.receiverID = '';
        this.checkReader = [];
        this.stateStatus = {
            cancel: 0,
            kick: 0,
        };
        this.messages;
        this.payload;
        this.stateUpload =  {
                file: '',
                name: '',
                group: '',
                sender: ''
            }
    }


    get myBot() {
        const bot = ['u653c0c37cdaefb7f583023c02cb8384a','u2297b268eec8988b3c32ffa058b0a248','uea50f7108c44b400a9f70b75f7848fcf','u32ef4dadf69649c7199b81bb7f4a3df0','ua89b571977cb320814c4175591db2d23','u90a32052cf753761431423d1ee234591','u8b8fad7361ed7c32a1b9c2448732f528','u7cbe6149e62a5df0d42c46f590760601','u14f64e139a3817afaabe27d237afb36b','u8748762cfc5091da024235c27975a0e0','ue43a33a6ea6350447b7ca1de72e23c2e','u8333a7b83f7742aa795672420d2376df','ud7fb95cc02f0f7d09898669633520040'];
        return bot; 
    }

    isAdminOrBot(param) {
        return this.myBot.includes(param);
    }

    getOprationType(operations) {
        for (let key in OpType) {
            if(operations.type == OpType[key]) {
                if(key !== 'NOTIFIED_UPDATE_PROFILE') {
                    console.info(`[* ${operations.type} ] ${key} `);
                }
            }
        }
    }

    poll(operation) {
        if(operation.type == 25 || operation.type == 26) {
            let message = new Message(operation.message);
            this.receiverID = message.to = (operation.message.to === this.myBot[0]) ? operation.message.from : operation.message.to ;
            Object.assign(message,{ ct: operation.createdTime.toString() });
            this.textMessage(message)
        }

        if(operation.type == 13 && this.stateStatus.cancel == 1) {
            this._cancel(operation.param2,operation.param1);
            
        }

        if(operation.type == 11 && !this.isAdminOrBot(operation.param2) && this.stateStatus.qrp == 1) {
            this._kickMember(operation.param1,[operation.param2]);
            this.messages.to = operation.param1;
            this.qrOpenClose();
        }

        if(operation.type == 19) { //ada kick
     {
let nadyaq = new Message();
nadyaq.to = operation.param1;
nadyaq.text = "Woooiii!!! Jangan Main Kick Sembarangan!!! Aku Kick Kamu Yaa, Byeee!!!"
this._client.sendMessage(0,nadyaq);
     }
            // op1 = group nya
            // op2 = yang 'nge' kick
            // op3 = yang 'di' kick

            if(!this.isAdminOrBot(operation.param2)){
                this._kickMember(operation.param1,[operation.param2]);
            } 
            if(!this.isAdminOrBot(operation.param3)){
                this._invite(operation.param1,[operation.param3]);
            }

        }

if(operation.type == 11) { //bukattupQR
     {
let nadyasayang = new Message();
nadyasayang.to = operation.param1;
nadyasayang.text = "Jangan Ubah Gambar Dan Nama Group/Jangan Dimainin QR-nya -__- Aku Kick Yaa !"+"Cuma Admin Yang Bisa!!!"
this._client.sendMessage(0,nadyasayang);
     }
            if(!this.isAdminOrBot(operation.param2)){
                this._kickMember(operation.param1,[operation.param2]);
            } 
}

if(operation.type == 15) { //leave grup
     {
let nadyasayang = new Message();
nadyasayang.to = operation.param1;
nadyasayang.text = "Kenapa Keluar Dia? Aku Invite Lagi Yaa ^_^"

this._client.sendMessage(0,nadyasayang);
     }
  this._invite(operation.param1,[operation.param2]);
}

if(operation.type == 17) { //joingroup
let nadyaq = new Message();
nadyaq.to = operation.param1;
nadyaq.text = "Hallo "+"Selamat Datang ^_^ Jangan Nakal Yaa Di Group Ini ^_^"

this._client.sendMessage(0,nadyaq);
}

if(operation.type == 32) { //adaygbatalin
let nadyaq = new Message();
nadyaq.to = operation.param1;
nadyaq.text = "Kok Dibatalin? Emangnya Dia Siapa?"

this._client.sendMessage(0,nadyaq);
     }

        if(operation.type == 55){ //ada reader
            const idx = this.checkReader.findIndex((v) => {
                if(v.group == operation.param1) {
                    return v
                }
            })
            if(this.checkReader.length < 1 || idx == -1) {
                this.checkReader.push({ group: operation.param1, users: [operation.param2], timeSeen: [operation.param3] });
            } else {
                for (var i = 0; i < this.checkReader.length; i++) {
                    if(this.checkReader[i].group == operation.param1) {
                        if(!this.checkReader[i].users.includes(operation.param2)) {
                            this.checkReader[i].users.push(operation.param2);
                            this.checkReader[i].timeSeen.push(operation.param3);
                        }
                    }
                }
            }
        }


        if(operation.type == 5) { // diadd
let nadyaq = new Message();
nadyaq.to = operation.param1;
nadyaq.text = "Thx For Add Me ^_^ Invite Me To Your Group ^_^"
this._client.sendMessage(0,nadyaq);
}

        if(operation.type == 13) { // diinvite
                this._acceptGroupInvitation(operation.param1);
let nadyaq = new Message();
nadyaq.to = operation.param1;
nadyaq.text = "Thx For Invite ^_^ Ketik Help Untuk Melihat Keyword"

this._client.sendMessage(0,nadyaq);
}
        this.getOprationType(operation);
    }

    command(msg, reply) {
        if(this.messages.text !== null) {
            if(this.messages.text === msg.trim()) {
                if(typeof reply === 'function') {
                    reply();
                    return;
                }
                if(Array.isArray(reply)) {
                    reply.map((v) => {
                        this._sendMessage(this.messages, v);
                    })
                    return;
                }
                return this._sendMessage(this.messages, reply);
            }
        }
    }

    async textMessage(messages) {
        this.messages = messages;
        let payload = (this.messages.text !== null) ? this.messages.text.split(' ').splice(1).join(' ') : '' ;
        let receiver = messages.to;
        let sender = messages.from;
        
this.command('Halo', ['halo disini Chucky','kamu siapa?']);
this.command('Hi', ['hi disini Chucky','kamu siapa?']);

this.command('Babi', ['mirip x sma kkak :v']);
this.command('Babik', ['mirip x sma kkak :v']);

this.command('Chucky', ['apa kak?','ada yg bisa dibantu?']);

this.command('P', ['kenapa kak keyboardnya? rusak yaa kak?']);
this.command('.', ['kenapa kak keyboardnya? rusak yaa kak?']);
this.command('?', ['kenapa kak keyboardnya? rusak yaa kak?']);

this.command('Tes', ['jaringannya lambat yaa kak?']);
this.command('Test', ['jaringannya lambat yaa kak?']);

this.command('Pagi', ['pagi juga kkak :)']);
this.command('Morning', ['pagi juga kkak :)']);

this.command('Siang', ['siang juga kkak :)','udah makan kan kak?']);
this.command('Siank', ['siang juga kkak :)']);

this.command('Sore', ['sore juga kkak :)','sono kak mandi, udh bau']);

this.command('Tidur', ['moga mimpi basah yaa kak :v']);

this.command('Malam', ['emank malam kak','yg bilang ini msih pagi spa kak!?']);
this.command('Night', ['emank malam kak','yg bilang ini msih pagi spa kak!?']);

this.command('O', ['o itu bulat kak']);

this.command('Kuy', ['mau kemana kak?']);
this.command('Ayo', ['mau kemana kak?']);
this.command('Ayok', ['mau kemana kak?']);
this.command('Yuk', ['mau kemana kak?']);

this.command('Mabar', ['kuuy, otw','invite yaa kak']);

this.command('Main', ['jgn main aja kak, udah gede']);
this.command('Main?', ['main apa kak?']);

this.command('Jelek', ['situ yg jelek']);

this.command('Cantik', ['maaciihh :)']);

this.command('Gila', ['spa gila kak?']);
this.command('Gilak', ['situ yg gilak']);

this.command('Bot lemot', ['jaringan u yg lemot']);

this.command('Anjing', ['kok kasar?']);
this.command('Njir', ['kok kasar?']);
this.command('Njay', ['kok kasar gitu?']);
this.command('Anjir', ['kok kasar gitu?']);
this.command('Anjer', ['kok kasar gitu?']);
this.command('Njor', ['kok kasar gitu?']);

this.command('Fak', ['apa itu artinya kak?']);
this.command('Fuck', ['apa artinya itu kak?']);

this.command('R', ['udah gede kan?','rein aja sendiri, jgn manja']);
this.command('r', ['udah gede kan?','rein aja sendiri, jgn manja']);
this.command('Rein', ['udah gede kan?','rein aja sendiri, jgn manja']);
this.command('Reinvite', ['udah gede kan?','rein aja sendiri, jgn manja']);

this.command('@bye', ['ihhh kkak main ngusir aja','kan aku msih mau disini']);
this.command('Bye', ['byeee, semoga diterima amalnya']);

this.command('Edit', ['ndasmu editan -,-']);
this.command('Editan', ['ndasmu editan -,-']);

this.command('Wkwkwk', ['gak lucu peak!']);
this.command('Wkwk', ['gk lucu ketawa -,-']);
this.command('Hahaha', ['gak lucu aja pun']);
this.command('Hehe', ['ada yg lucu?']);
this.command('Haha', ['ada yg lucu?']);

this.command('Ok', ['sok ok u']);
this.command('Oke', ['sok ok u']);
this.command('Okay', ['sok ok u']);
this.command('Oce', ['sok ok u']);
this.command('Okee', ['sok ok u']);

this.command('Pc', ['jgn mau pc sma dia']);
this.command('Cpc', ['jgn mau cpc sma dia']);

this.command('Aduh', ['aduh knp kak?']);
this.command('Aduhh', ['mana yg sakit kak?']);

this.command('Iya', ['iya aja yekan biar cpet']);
this.command('Y', ['malez ngetik yaa? cuma ketik Y']);

this.command('Cie', ['cie cie, mek kemek lha kak :v']);

this.command('69', ['gaya ena ena itu kak :v']);

this.command('Lagi', ['udh kak, bsok lgi']);
this.command('Lagi?', ['mirip x sma kkak :v']);

this.command('Nah', ['nahh apa sihh kak?']);
this.command('Nahh', ['nahh apa sihh kak?']);

this.command('Tai', ['tu ada tai di jidad kkak :v']);
this.command('Taik', ['tu ada taik di jidad kkak :v']);

this.command('Lag', ['main di goa yaa ngelag lha peak']);
this.command('Ngelag', ['main di goa yaa ngelag lha peak']);

this.command('Itu bot', ['iya, aku bot']);
this.command('Itu bot?', ['iya, aku bot']);
this.command('Itu bot??', ['iya, aku bot']);

this.command('Mati', ['lu aja yg mati diluan']);

this.command('Sayur', ['sayur mah bebas']);

this.command('On', ['udh on di lobby dri td']);
this.command('Off', ['napa off kak?']);

this.command('Ngakak', ['wuhahaha']);

this.command('Ngantuk', ['ngantuk yaa tidur']);

this.command('Laper', ['laper yaa makan gblok']);

this.command('Makan', ['mau mkan pa kak']);

this.command('Bacot', ['suka2 dia lha yg bacot']);
this.command('Cot', ['siapa?']);
this.command('Bct', ['siapa?']);

this.command('Masa?', ['iyaa lhoo kak','gak prcayaan amat']);
this.command('Masa', ['iyaa lhoo kak','gak percayaan amat']);

this.command('Hooh', ['napa lu? sesak nafas?']);

this.command('Bot peak', ['situ yg peak']);
this.command('Bot pea', ['situ yg pea']);

this.command('Izin', ['knpa gak dri kmarin lu izin']);

this.command('Rame', ['wooii bubar wooii bubarrr']);

this.command('Sini', ['ngapain kak?']);

this.command('Loading', ['yaa tunggu lha klo loading, lucu']);

this.command('Lama', ['sabar lha u tai']);
this.command('Lola', ['sabar lha u tai']);
this.command('Lelet', ['sabar lha u tai']);
this.command('Lambat', ['sabar lha u tai']);
this.command('Lemot', ['sabar lha u tai']);
this.command('Lama banget', ['bntar lgi, sabar napa u']);
this.command('Lama x', ['sabar lha u tai']);

this.command('Udah', ['hbis ngapain kak?']);
this.command('Udah?', ['udah dlu kak, lanjut bsok lgi']);

this.command('Wtf', ['kpanjangan dari what the fuck']);

this.command('Pea', ['lu lha yg pea']);
this.command('Peak', ['u lha yg peak']);

this.command('Siapa itu', ['gk tau, mungkin kicker']);
this.command('Siapa', ['nanyak?']);

this.command('Beb', ['ada apa beb?']);
this.command('Sayang', ['knpa sayangku?']);

this.command('Apa', ['gpp kak']);
this.command('Apa?', ['gpp kok kak','cuma manggil aja']);

this.command('Pc aja', ['malez, gak penting pc sma lu']);
this.command('Pc', ['malez, gak penting pc sma lu']);
this.command('Vc', ['ogah vc sma lu, muka lu jelek']);
this.command('Vicall', ['ogah vc sma lu, muka lu jelek']);

this.command('Bah', ['kaget?']);

this.command('Wc', ['moga betah yaa :)']);
this.command('Welcome', ['moga betah yaa dsni :)']);

this.command('Kick me', ['keluar aja sendiri, gak ada yang larang']);

this.command('Baper', ['gitu ajj lu baper']);
this.command('Baperan', ['gitu aja lu baperan -,-']);

this.command('Om', ['om ndas mu, u kira aku udh tua -,-']);

this.command('Wait', ['apa lg yg mau di tunggu?']);
this.command('Ok wait', ['apa lg yg mau di tunggu?']);
this.command('Tunggu', ['jgn lama lama yaa kak']);
this.command('Bentar', ['nunggu apa lg kak?']);

this.command('Nice', ['mantap soul!']);

this.command('Mantap', ['apanya yg mantap?']);

this.command('Galau', ['ululu thayank, sini peyuk :*']);

this.command('Kalah',['gara gara kkak beban jadi kalah']);
this.command('Lose',['gara gara kkak beban jadi kalah']);

this.command('Rank?', ['moh, lu noob']);
this.command('Rank', ['moh, lu noob']);

this.command('Sumpah', ['sumpah mi apa kkak?']);

this.command('Otw', ['mau kemana kak?','ikuttt']);

this.command('Gas', ['apa yg mau di gas nii?']);

this.command('Sepi', ['iyaa sepii','kyak hati lu sepi :v']);

this.command('Jomblo', ['duhh, kkak msih jomblo?']);
this.command('Mblo', ['duhh, kkak msih jomblo?']);
this.command('Jones', ['dasar jomblo ngenes :v']);

this.command('Yowes', ['udh gtu ajj?']);
this.command('Uwes', ['udh gtu ajj?']);
this.command('Wes', ['udh gtu ajj?']);
this.command('Yaudah', ['ngambek yaa?']);

this.command('Moh', ['yaudah klo kkak gamau']);
this.command('Ogah', ['yaudah klo kkak gamau']);
this.command('Ga', ['yaudah klo kkak gamau']);
this.command('Gak', ['yaudah klo kkak gamau']);
this.command('Gk', ['yaudah klo kkak gamau']);

this.command('Kids jaman now', ['maklum aja kak sma anak jman skrg']);

this.command('Spam', ['yg spam di kick ajj']);

this.command('Jangan', ['jangan smpe gk jadi :v']);

this.command('Skip', ['yaudah klo kkak gamau']);
this.command('Sekip', ['yaudah klo kkak gamau']);

this.command('Undang', ['undang kak, aku udh di lobby']);
this.command('Invite', ['Ok invite, aku udh di lobby']);

this.command('Bot', ['apa kak manggil2 aku?']);
this.command('Bot chucky', ['apa kak manggil2 aku?']);

this.command('Kurang 1', ['kurang 1 yaa kak?','invite aku ajj kak']);
this.command(' -1', ['kurang 1 yaa kak?','invite aku ajj kak']);

this.command('Noob', ['sama, lu juga noob']);

this.command('Lagi apa?', ['lagi berak nii kak']);
this.command('Lagi apa nadya?', ['lagi berak nii kak']);

this.command('Php', ['udah sabar aja, ntar juga terbiasa kena php']);
this.command('Pehape', ['udah sabar aja, ntar juga terbiasa kena php']);

this.command('Sorry', ['udah aku maafin kok kak :)']);
this.command('Maaf', ['udah aku maafin kok kak :)']);
this.command('Maafin', ['udah aku maafin kok kak :)']);











this.command('halo', ['halo disini Chucky','kamu siapa?']);
this.command('hi', ['hi disini Chucky','kamu siapa?']);

this.command('babi', ['mirip x sma kkak :v']);
this.command('babik', ['mirip x sma kkak :v']);

this.command('chucky', ['apa kak?','ada yg bisa dibantu?']);

this.command('p', ['kenapa kak keyboardnya? rusak yaa kak?']);
this.command('.', ['kenapa kak keyboardnya? rusak yaa kak?']);
this.command('?', ['kenapa kak keyboardnya? rusak yaa kak?']);

this.command('tes', ['jaringannya lambat yaa kak?']);
this.command('test', ['jaringannya lambat yaa kak?']);

this.command('pagi', ['pagi juga kkak :)','baru bangun yaa kak?']);
this.command('morning', ['pagi juga kkak :)','baru bangun yaa kak?']);

this.command('siang', ['siang juga kkak :)','udah makan kan kak?']);
this.command('siank', ['siang juga kkak :)']);

this.command('sore', ['sore juga kkak :)','sono kak mandi, udh bau']);

this.command('tidur', ['moga mimpi basah yaa kak :v']);

this.command('malam', ['emank malam kak','yg bilang ini msih pagi spa kak!?']);
this.command('night', ['emank malam kak','yg bilang ini msih pagi spa kak!?']);

this.command('o', ['o itu bulat kak']);

this.command('kuy', ['mau kemana kak?']);
this.command('ayo', ['mau kemana kak?']);
this.command('ayok', ['mau kemana kak?']);
this.command('yuk', ['mau kemana kak?']);

this.command('mabar', ['kuuy, otw','invite yaa kak']);

this.command('main', ['jgn main aja kak, udah gede']);
this.command('main?', ['main apa kak?']);

this.command('jelek', ['situ yg jelek']);

this.command('cantik', ['maaciihh :)']);

this.command('gila', ['spa gila kak?']);
this.command('gilak', ['situ yg gilak']);

this.command('bot lemot', ['jaringan u yg lemot']);

this.command('anjing', ['kok kasar?']);
this.command('njir', ['kok kasar?']);
this.command('njay', ['kok kasar gitu?']);
this.command('anjir', ['kok kasar gitu?']);
this.command('anjer', ['kok kasar gitu?']);
this.command('njor', ['kok kasar gitu?']);

this.command('fak', ['apa itu artinya kak?']);
this.command('fuck', ['apa artinya itu kak?']);

this.command('rein', ['udah gede kan?','rein aja sendiri, jgn manja']);
this.command('reinvite', ['udah gede kan?','rein aja sendiri, jgn manja']);

this.command('bye', ['byeee, semoga diterima amalnya']);

this.command('edit', ['ndasmu editan -,-']);
this.command('editan', ['ndasmu editan -,-']);

this.command('wkwkwk', ['gak lucu peak!']);
this.command('wkwk', ['gk lucu ketawa -,-']);
this.command('hahaha', ['gak lucu aja pun']);
this.command('hehe', ['ada yg lucu?']);
this.command('haha', ['ada yg lucu?']);

this.command('ok', ['sok ok u']);
this.command('oke', ['sok ok u']);
this.command('okay', ['sok ok u']);
this.command('oce', ['sok ok u']);
this.command('okee', ['sok ok u']);

this.command('pc', ['jgn mau pc sma dia']);
this.command('cpc', ['jgn mau cpc sma dia']);

this.command('Aaduh', ['aduh knp kak?']);
this.command('aduhh', ['mana yg sakit kak?']);

this.command('iya', ['iya aja yekan biar cpet']);
this.command('y', ['malez ngetik yaa? cuma ketik Y']);

this.command('cie', ['cie cie, mek kemek lha kak :v']);

this.command('lagi', ['udh kak, bsok lgi']);
this.command('Lagi?', ['mirip x sma kkak :v']);

this.command('nah', ['nahh apa sihh kak?']);
this.command('nahh', ['nahh apa sihh kak?']);

this.command('tai', ['tu ada tai di jidad kkak :v']);
this.command('taik', ['tu ada taik di jidad kkak :v']);

this.command('lag', ['main di goa yaa ngelag lha peak']);
this.command('ngelag', ['main di goa yaa ngelag lha peak']);

this.command('itu bot', ['iya, aku bot']);
this.command('itu bot?', ['iya, aku bot']);
this.command('itu bot??', ['iya, aku bot']);

this.command('mati', ['lu aja yg mati diluan']);

this.command('sayur', ['sayur mah bebas']);

this.command('on', ['udh on di lobby dri td']);
this.command('off', ['napa off kak?']);

this.command('ngakak', ['wuhahaha']);

this.command('ngantuk', ['ngantuk yaa tidur']);

this.command('laper', ['laper yaa makan gblok']);

this.command('makan', ['mau mkan pa kak']);

this.command('bacot', ['suka2 dia lha yg bacot']);
this.command('cot', ['siapa?']);
this.command('bct', ['siapa?']);

this.command('masa?', ['iyaa lhoo kak','gak prcayaan amat']);
this.command('masa', ['iyaa lhoo kak','gak percayaan amat']);

this.command('hooh', ['napa lu? sesak nafas?']);

this.command('bot peak', ['situ yg peak']);
this.command('bot pea', ['situ yg pea']);

this.command('izin', ['knpa gak dri kmarin lu izin']);

this.command('rame', ['wooii bubar wooii bubarrr']);

this.command('sini', ['ngapain kak?']);

this.command('loading', ['yaa tunggu lha klo loading, lucu']);

this.command('lama', ['sabar lha u tai']);
this.command('lola', ['sabar lha u tai']);
this.command('lelet', ['sabar lha u tai']);
this.command('lambat', ['sabar lha u tai']);
this.command('lemot', ['sabar lha u tai']);
this.command('lama banget', ['bntar lgi, sabar napa u']);
this.command('lama x', ['sabar lha u tai']);

this.command('udah', ['hbis ngapain kak?']);
this.command('udah?', ['udah dlu kak, lanjut bsok lgi']);

this.command('wtf', ['kpanjangan dari what the fuck']);

this.command('pea', ['lu lha yg pea']);
this.command('peak', ['u lha yg peak']);

this.command('siapa itu', ['gk tau, mungkin kicker']);
this.command('ssiapa', ['nanyak?']);

this.command('beb', ['ada apa beb?']);
this.command('sayang', ['knpa sayangku?']);

this.command('apa', ['gpp kak']);
this.command('apa?', ['gpp kok kak','cuma manggil aja']);

this.command('vc', ['ogah vc sma lu, muka lu jelek']);
this.command('vicall', ['ogah vc sma lu, muka lu jelek']);

this.command('bbah', ['kaget?']);

this.command('wc', ['moga betah yaa :)']);
this.command('welcome', ['moga betah yaa dsni :)']);

this.command('kick me', ['dengan senang hati']);

this.command('baper', ['gitu ajj lu baper']);
this.command('baperan', ['gitu aja lu baperan -,-']);

this.command('om', ['om ndas mu, u kira aku udh tua -,-']);

this.command('wait', ['apa lg yg mau di tunggu?']);
this.command('ok wait', ['apa lg yg mau di tunggu?']);
this.command('tunggu', ['jgn lama lama yaa kak']);
this.command('bentar', ['nunggu apa lg kak?']);

this.command('nice', ['mantap soul!']);

this.command('mantap', ['apanya yg mantap?']);

this.command('galau', ['ululu thayank, sini peyuk :*']);

this.command('kalah',['gara gara kkak beban jadi kalah']);
this.command('lose',['gara gara kkak beban jadi kalah']);

this.command('rank?', ['moh, lu noob']);
this.command('rank', ['moh, lu noob']);

this.command('sumpah', ['sumpah mi apa kkak?']);

this.command('otw', ['mau kemana kak?','ikuttt']);

this.command('gas', ['apa yg mau di gas nii?']);

this.command('sepi', ['iyaa sepii','kyak hati lu sepi :v']);

this.command('jomblo', ['duhh, kkak msih jomblo?']);
this.command('mblo', ['duhh, kkak msih jomblo?']);
this.command('jones', ['dasar jomblo ngenes :v']);

this.command('yowes', ['udh gtu ajj?']);
this.command('uwes', ['udh gtu ajj?']);
this.command('wes', ['udh gtu ajj?']);
this.command('yaudah', ['ngambek yaa?']);

this.command('moh', ['yaudah klo kkak gamau']);
this.command('ogah', ['yaudah klo kkak gamau']);
this.command('ga', ['yaudah klo kkak gamau']);
this.command('gak', ['yaudah klo kkak gamau']);
this.command('gk', ['yaudah klo kkak gamau']);

this.command('kids jaman now', ['maklum aja kak sma anak jman skrg']);

this.command('jangan', ['jangan smpe gk jadi :v']);

this.command('skip', ['yaudah klo kkak gamau']);
this.command('sekip', ['yaudah klo kkak gamau']);

this.command('undang', ['undang kak, aku udh di lobby']);
this.command('Invite', ['Ok invite, aku udh di lobby']);

this.command('bot', ['apa kak manggil2 aku?']);
this.command('bot chucky', ['apa kak manggil2 aku?']);

this.command('kurang 1', ['kurang 1 yaa kak?','invite aku ajj kak']);
this.command(' -1', ['kurang 1 yaa kak?','invite aku ajj kak']);

this.command('noob', ['sama, lu juga noob']);

this.command('lagi apa?', ['lagi berak nii kak']);
this.command('lagi apa nadya?', ['lagi berak nii kak']);

this.command('php', ['udah sabar aja, ntar juga terbiasa kena php']);
this.command('pehape', ['udah sabar aja, ntar juga terbiasa kena php']);

this.command('sorry', ['udah aku maafin kok kak :)']);
this.command('maaf', ['udah aku maafin kok kak :)']);
this.command('maafin', ['udah aku maafin kok kak :)']);



        this.command('Siapa kamu', this.getProfile.bind(this));
        this.command('Status', `Your Status: ${JSON.stringify(this.stateStatus)}`);
        this.command(`Left ${payload}`, this.leftGroupByName.bind(this));
        this.command('Speed', this.getSpeed.bind(this));
        this.command('Kernel', this.checkKernel.bind(this));
        this.command(`Kick ${payload}`, this.OnOff.bind(this));
        this.command(`Cancel ${payload}`, this.OnOff.bind(this));
        this.command(`Qrp ${payload}`, this.OnOff.bind(this));
        this.command(`Kickall ${payload}`,this.kickAll.bind(this));
        this.command(`Cancelall ${payload}`, this.cancelMember.bind(this));
        this.command(`Set`,this.setReader.bind(this));
        this.command(`set`,this.setReaderr.bind(this));
        this.command(`Setpoint`,this.setReaderrr.bind(this));
        this.command(`setpoint`,this.setReaderrrr.bind(this));
        this.command(`Recheck`,this.rechecks.bind(this));
        this.command(`recheck`,this.recheckss.bind(this));
        this.command(`Check`,this.rechecksss.bind(this));
        this.command(`check`,this.recheckssss.bind(this));
        this.command(`check sider`,this.recheck.bind(this));
        this.command(`Clearall`,this.clearall.bind(this));
        this.command(`Clear`,this.clear.bind(this));
        this.command(`clear`,this.clear1.bind(this));
        this.command(`Reset`,this.reset.bind(this));
        this.command(`reset`,this.reset1.bind(this));
        this.command('Myid',`Your ID: ${messages.from}`)
        this.command(`ip ${payload}`,this.checkIP.bind(this))
        this.command(`Ig ${payload}`,this.checkIG.bind(this))
        this.command(`Qr ${payload}`,this.qrOpenClose.bind(this))
        this.command(`Joinqr ${payload}`,this.joinQr.bind(this));
        this.command(`spam ${payload}`,this.spam2.bind(this));
        this.command(`Spamgroup ${payload}`,this.spamGroup.bind(this));
        this.command(`Creator`,this.creator.bind(this));
        this.command(`List admin`,this.list.bind(this));
        this.command(`Admin1`,this.admin1.bind(this));
        this.command(`Admin2`,this.admin2.bind(this));
        this.command(`Admin3`,this.admin3.bind(this));
        this.command(`Admin4`,this.admin4.bind(this));
        this.command(`Admin5`,this.admin5.bind(this));
        this.command(`Admin6`,this.admin6.bind(this));
        this.command(`Admin7`,this.admin7.bind(this));
        this.command(`Admin8`,this.admin8.bind(this));
        this.command(`Admin9`,this.admin9.bind(this));
        this.command(`Admin10`,this.admin10.bind(this));
        this.command(`Admin11`,this.admin11.bind(this));
        this.command(`Admin12`,this.admin12.bind(this));
        this.command(`Admin13`,this.admin13.bind(this));
        this.command(`Admin14`,this.admin14.bind(this));
        this.command(`Admin15`,this.admin15.bind(this));
        this.command(`Pap ${payload}`,this.searchLocalImage.bind(this));
        this.command(`Upload ${payload}`,this.prepareUpload.bind(this));
        this.command(`Tag all`,this.tagall.bind(this));
        this.command(`Tagall`,this.tagall1.bind(this));
        this.command(`Help`,this.help.bind(this));
        this.command(`/help`,this.help1.bind(this));
        this.command(`Keyword`,this.help2.bind(this));
        this.command(`Key`,this.help3.bind(this));
        this.command(`Chat1`,this.chat1.bind(this));
        this.command(`Chat2`,this.chat2.bind(this));
        this.command(`Chat3`,this.chat3.bind(this));
        this.command(`Info kick`,this.infokick.bind(this));
        this.command(`List lagu1`,this.listlagu1.bind(this));
        this.command(`List lagu2`,this.listlagu2.bind(this));
        this.command(`Chucky keluar`,this.keluar.bind(this));
        this.command(`Batal`,this.batal.bind(this));


        if(messages.contentType == 13) {
            messages.contentType = 0;
            if(!this.isAdminOrBot(messages.contentMetadata.mid)) {
                this._sendMessage(messages,messages.contentMetadata.mid);
            }
            return;
        }

  if (messages.text == 'Gift'){
        messages.contentType = 0;
       this._sendMessage(messages, "gift sent",messages.contentMetadata=null,messages.contentType=9);
     }


  if (messages.text == 'Silahkan'){
               await this._sendMessage(messages,'Kakak Jahat :( Lain X Jangan Invite Aku Lagi -,-');
     {
this._leaveGroup(this.messages.to);
     }
     }

        if(this.stateUpload.group == messages.to && [1,2,3].includes(messages.contentType)) {
            if(sender === this.stateUpload.sender) {
                this.doUpload(messages);
                return;
            } else {
                messages.contentType = 0;
                this._sendMessage(messages,'Wrong Sender !! Reseted');
            }
            this.resetStateUpload();
            return;
        }

        // if(cmd == 'lirik') {
        //     let lyrics = await this._searchLyrics(payload);
        //     this._sendMessage(seq,lyrics);
        // }

    }

}

module.exports = LINE;
