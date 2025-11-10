import { Building, Users, Goal, Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const aboutHeroImage = PlaceHolderImages.find((p) => p.id === "about-hero");

export default function AboutUsPage() {
  return (
    <div className="bg-background">
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-foreground">
            Om SENSO
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            Vi er et team av lidenskapelige ingeniører og innovatører dedikert til å revolusjonere industrielt vedlikehold gjennom prediktiv teknologi.
          </p>
        </div>
      </section>

      {aboutHeroImage && (
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-16">
            <div className="rounded-lg overflow-hidden shadow-2xl max-w-5xl mx-auto">
                <Image
                    src={aboutHeroImage.imageUrl}
                    alt={aboutHeroImage.description}
                    width={1280}
                    height={600}
                    className="w-full h-auto object-cover"
                    data-ai-hint={aboutHeroImage.imageHint}
                />
            </div>
        </div>
      )}

      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold font-headline mb-4">Vår historie</h2>
            <p className="text-muted-foreground mb-4">
              SENSO ble grunnlagt i 2023 med en enkel, men kraftfull idé: å forutsi maskinfeil før de skjer. Frustrert over de høye kostnadene og den operasjonelle hodepinen forårsaket av uventet nedetid, bestemte våre grunnleggere seg for å bygge en løsning som gir bedrifter verktøyene til å være proaktive, ikke reaktive.
            </p>
            <p className="text-muted-foreground">
              Fra en beskjeden start i en liten garasje, har vi vokst til å bli en betrodd partner for produsenter over hele landet, og hjelper dem med å spare millioner i vedlikeholdskostnader og tapt produksjon.
            </p>
          </div>
          <div>
            <Card>
              <CardHeader className="flex-row items-center gap-4">
                <Goal className="h-10 w-10 text-primary" />
                <div>
                  <CardTitle className="font-headline">Vår misjon</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Å gi enhver industribedrift muligheten til å oppnå null uplanlagt nedetid gjennom intelligent, tilgjengelig og brukervennlig prediktivt vedlikehold.
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                 <Card className="bg-background">
                    <CardHeader className="flex-row items-center gap-4">
                        <Building className="h-10 w-10 text-primary" />
                        <div>
                        <CardTitle className="font-headline">Vår visjon</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            En fremtid der alle industrielle maskiner er smarte, selvhelbredende og fullstendig pålitelige, noe som driver en mer effektiv og bærekraftig global produksjon.
                        </p>
                        </div>
                    </CardHeader>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

       <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold font-headline">Møt teamet</h2>
                  <p className="mt-2 text-muted-foreground">De dedikerte personene bak SENSO.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                  <TeamMember
                      name="Lise Hansen"
                      title="CEO & Co-founder"
                      avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704a"
                  />
                  <TeamMember
                      name="Karl Jensen"
                      title="CTO & Co-founder"
                      avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704b"
                  />
                  <TeamMember
                      name="Aisha Ahmed"
                      title="Lead AI Engineer"
                      avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704c"
                  />
                  <TeamMember
                      name="Petter Olsen"
                      title="Head of Sales"
                      avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                  />
              </div>
          </div>
      </section>

      <section id="contact" className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Kontakt oss</h2>
            <p className="mt-2 text-muted-foreground">Vi vil gjerne høre fra deg! Ta kontakt for en uforpliktende prat.</p>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
             <ContactInfo icon={Mail} title="E-post" info="kontakt@senso.no" href="mailto:kontakt@senso.no" />
             <ContactInfo icon={Phone} title="Telefon" info="+47 123 45 678" href="tel:+4712345678" />
             <ContactInfo icon={MapPin} title="Adresse" info="Innovasjonsveien 123, 0349 Oslo" />
          </div>
        </div>
      </section>
    </div>
  );
}

const TeamMember = ({ name, title, avatarUrl }: { name: string; title: string; avatarUrl: string }) => (
    <div className="text-center">
        <Avatar className="h-32 w-32 mx-auto mb-4">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-bold font-headline">{name}</h3>
        <p className="text-muted-foreground">{title}</p>
    </div>
)


const ContactInfo = ({ icon: Icon, title, info, href }: { icon: React.ElementType, title: string, info: string, href?: string }) => (
    <Card className="p-6">
        <Icon className="h-10 w-10 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-headline font-semibold">{title}</h3>
        {href ? (
             <a href={href} className="text-muted-foreground hover:text-primary transition-colors">{info}</a>
        ) : (
             <p className="text-muted-foreground">{info}</p>
        )}
    </Card>
)
